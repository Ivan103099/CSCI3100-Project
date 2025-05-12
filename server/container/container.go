package container

import (
	"fmt"
	"sync"
)

type Dependencies map[string]any

type Provider[T any] func(c *Container) T

type Container struct {
	deps   Dependencies
	values map[string]any
}

func New(deps Dependencies) *Container {
	return &Container{deps: deps, values: make(map[string]any)}
}

func do[T any](c *Container, f func(dep T) error) (errs map[string]error) {
	g := new(sync.WaitGroup)
	mx := new(sync.Mutex)
	for name, dep := range c.deps {
		if d, ok := dep.(T); ok {
			go func(name string, d T) {
				defer g.Done()
				if err := f(d); err != nil {
					mx.Lock()
					defer mx.Unlock()
					if errs == nil {
						errs = make(map[string]error)
					}
					errs[name] = err
				}
			}(name, d)
			g.Add(1)
		}
	}
	g.Wait()
	return
}

type Initializable interface {
	Initialize() error
}

type Terminatable interface {
	Terminate() error
}

func (c *Container) Initialize() map[string]error {
	return do(c, func(dep Initializable) error { return dep.Initialize() })
}

func (c *Container) Terminate() (errs map[string]error) {
	return do(c, func(dep Terminatable) error { return dep.Terminate() })
}

func Provide[T any](c *Container, name string, provider Provider[T]) {
	c.deps[name] = provider(c)
}

func Use[T any](c *Container, name string) T {
	if dep, ok := c.deps[name]; ok {
		return dep.(T)
	}
	panic(fmt.Errorf(`dependency "%s" does not exist`, name))
}

func Set(c *Container, name string, value any) {
	if _, ok := c.deps[name]; ok {
		panic(fmt.Errorf(`value "%s" already exists`, name))
	}
	c.values[name] = value
}

func Get[T any](c *Container, name string) T {
	if value, ok := c.values[name]; ok {
		return value.(T)
	}
	panic(fmt.Errorf(`value "%s" does not exist`, name))
}
