<?php
declare(strict_types=1);

final class Router
{
    /** @var array<int, array{method:string, pattern:string, regex:string, params:array, script:string, auth:bool, admin:bool}> */
    private array $routes = [];

    public function add(string $method, string $pattern, string $script, bool $auth = false, bool $admin = false): void
    {
        $paramNames = [];
        $regex = preg_replace_callback('#\{(\w+)\}#', function ($m) use (&$paramNames) {
            $paramNames[] = $m[1];
            return '([^/]+)';
        }, $pattern);
        $regex = '#^' . rtrim((string) $regex, '/') . '/?$#';

        $this->routes[] = [
            'method' => strtoupper($method),
            'pattern' => $pattern,
            'regex' => $regex,
            'params' => $paramNames,
            'script' => $script,
            'auth' => $auth,
            'admin' => $admin,
        ];
    }

    public function get(string $pattern, string $script, bool $auth = false, bool $admin = false): void
    {
        $this->add('GET', $pattern, $script, $auth, $admin);
    }

    public function match(string $method, string $uri): ?array
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $path = rtrim($path, '/');
        if ($path === '') {
            $path = '/';
        }

        foreach ($this->routes as $route) {
            if ($route['method'] !== strtoupper($method) && $route['method'] !== 'ANY') {
                continue;
            }
            if (preg_match($route['regex'], $path, $matches)) {
                array_shift($matches);
                $params = array_combine($route['params'], $matches) ?: [];
                return [
                    'script' => $route['script'],
                    'params' => $params,
                    'auth' => $route['auth'],
                    'admin' => $route['admin'],
                ];
            }
        }
        return null;
    }
}
