package middlewares

import (
	"net"
	"net/http"
	"sync"

	"github.com/gorilla/mux"
	"github.com/tnychn/httpx"
	"golang.org/x/time/rate"
)

const (
	reqs  = rate.Limit(1) // 1 requests per second (steady rate)
	burst = 10            // 10 requests per burst (allowed burst size)
)

var (
	mu       = new(sync.Mutex)
	limiters = make(map[string]*Limiter)
)

type Limiter struct {
	*rate.Limiter
}

func RateLimit() mux.MiddlewareFunc {
	obtain := func(addr string) *Limiter {
		mu.Lock()
		defer mu.Unlock()
		if limiter, ok := limiters[addr]; ok {
			return limiter
		}
		limiter := &Limiter{rate.NewLimiter(reqs, burst)}
		limiters[addr] = limiter
		return limiter
	}
	return func(next http.Handler) http.Handler {
		return httpx.HandlerFunc(func(req *httpx.Request, res *httpx.Responder) error {
			if req.Method == http.MethodOptions {
				return httpx.H(next)(req, res)
			}
			host, _, _ := net.SplitHostPort(req.RemoteAddr)
			limiter := obtain(host)
			if !limiter.Allow() {
				return httpx.ErrTooManyRequests
			}
			return httpx.H(next)(req, res)
		})
	}
}
