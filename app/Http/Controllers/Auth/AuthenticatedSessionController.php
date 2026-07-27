<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Facades\Socialite;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Redirect the user to Google for authentication.
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')
            ->scopes(['https://www.googleapis.com/auth/drive'])
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent' // Wajib biar dapet refresh_token
            ])
            ->redirect();
    }

    /**
     * Handle the Google authentication callback.
     */
    public function handleGoogleCallback(): RedirectResponse
    {
        $driver = Socialite::driver('google');

        try {
            $googleUser = $driver->user();
        } catch (InvalidStateException) {
            $googleUser = $driver->stateless()->user();
        }

        $user = User::where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            return to_route('login')->withErrors([
                'email' => 'Akun tidak terdaftar. Silakan login dengan email/password atau hubungi admin.',
            ]);
        }

        // Update selalu token tiap kali login
        $user->fill([
            'google_id' => $googleUser->getId() ?? $user->google_id,
            'avatar' => $googleUser->getAvatar() ?? $user->avatar,
            'google_access_token' => $googleUser->token,
            'google_refresh_token' => $googleUser->refreshToken ?? $user->google_refresh_token, // Jangan ditimpa null
            'email_verified_at' => $user->email_verified_at ?? now(),
        ])->save();

        Auth::login($user, true);

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
