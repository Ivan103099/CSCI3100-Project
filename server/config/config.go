package config

import (
	"fmt"
	"net"
	"net/url"

	"github.com/caarlos0/env/v11"
)

type Config struct {
	Debug  bool `env:"DEBUG" default:"false"`
	Server struct {
		Host string `env:"HOST" default:"0.0.0.0"`
		Port uint16 `env:"PORT" default:"6969"`
	}
	Database struct {
		URL *url.URL `env:"DATABASE_URL,required"`
	}
	Secret string `env:"SECRET,required"`
}

func (c Config) ServerAddress() string {
	return net.JoinHostPort(c.Server.Host, fmt.Sprint(c.Server.Port))
}

func Load() (Config, error) {
	return env.ParseAsWithOptions[Config](env.Options{
		DefaultValueTagName: "default",
	})
}

func MustLoad() Config {
	config, err := Load()
	if err != nil {
		panic(err)
	}
	return config
}
