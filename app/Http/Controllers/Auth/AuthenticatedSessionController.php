<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Socialite\Two\GoogleProvider;
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
        $driver = Socialite::driver('google');

        if (! $driver instanceof GoogleProvider) {
            return to_route('login')->withErrors([
                'email' => 'Layanan login Google sedang tidak tersedia.',
            ]);
        }

        return $driver
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

        if (! $driver instanceof GoogleProvider) {
            return to_route('login')->withErrors([
                'email' => 'Layanan login Google sedang tidak tersedia.',
            ]);
        }

        try {
            $googleUser = $driver->user();
        } catch (InvalidStateException) {
            $googleUser = $driver->stateless()->user();
        }

        $email = $googleUser->getEmail();

        if (! $email) {
            return to_route('login')->withErrors([
                'email' => 'Akun Google tidak memiliki email yang valid.',
            ]);
        }

        $user = User::firstOrNew(['email' => $email]);

        if (! $user->exists) {
            $user->password = Hash::make(Str::random(64));
            $user->email_verified_at = now();
        }

        $user->name = $googleUser->getName() ?: $user->name ?: $email;
        $user->google_id = $googleUser->getId() ?: $user->google_id;
        $user->google_access_token = $googleUser->token;
        $user->google_refresh_token = $googleUser->refreshToken ?: $user->google_refresh_token;
        $user->avatar = $googleUser->getAvatar() ?: $user->avatar;
        $user->save();

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
