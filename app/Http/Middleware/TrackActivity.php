<?php

namespace App\Http\Middleware;

use App\Models\SystemLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackActivity
{
    // Routes to skip (assets, health, logout, etc.)
    private array $skip = [
        'up', 'logout', 'sanctum', 'livewire',
    ];

    private array $skipPrefixes = [
        '_', 'storage/', 'build/', 'favicon',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (
            auth()->check() &&
            $request->method() !== 'OPTIONS' &&
            !$this->shouldSkip($request)
        ) {
            $this->record($request);
        }

        return $response;
    }

    private function shouldSkip(Request $request): bool
    {
        $path = $request->path();

        foreach ($this->skipPrefixes as $prefix) {
            if (str_starts_with($path, $prefix)) return true;
        }

        foreach ($this->skip as $segment) {
            if (str_contains($path, $segment)) return true;
        }

        return false;
    }

    private function record(Request $request): void
    {
        try {
            $method = $request->method();
            $path   = $request->path();

            $action = match ($method) {
                'GET'    => 'visited ' . $path,
                'POST'   => 'created via ' . $path,
                'PUT',
                'PATCH'  => 'updated via ' . $path,
                'DELETE' => 'deleted via ' . $path,
                default  => $method . ' ' . $path,
            };

            SystemLog::create([
                'user_id'    => auth()->id(),
                'action'     => $action,
                'model_type' => null,
                'model_id'   => null,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'url'        => $request->fullUrl(),
                'method'     => $method,
            ]);
        } catch (\Throwable) {
            // Never let activity logging crash the request
        }
    }
}
