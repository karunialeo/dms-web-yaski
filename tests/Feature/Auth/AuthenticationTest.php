<?php

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\InvalidStateException;

test('login screen can be rendered', function () {
    $response = $this->get('/login');

    $response->assertStatus(200);
});

test('users can authenticate using the login screen', function () {
    $user = User::factory()->create();

    $response = $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with invalid password', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertGuest();
});

test('users can logout', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/logout');

    $this->assertGuest();
    $response->assertRedirect('/');
});

test('users can authenticate with google', function () {
    User::factory()->create([
        'email' => 'google.user@example.com',
    ]);

    $googleUser = new \Laravel\Socialite\Two\User();
    $googleUser->id = 'google-user-id';
    $googleUser->email = 'google.user@example.com';
    $googleUser->name = 'Google User';
    $googleUser->avatar = 'https://example.com/avatar.jpg';
    $googleUser->token = 'token';

    Socialite::shouldReceive('driver')->with('google')->andReturnSelf();
    Socialite::shouldReceive('user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $this->assertAuthenticated();
    $this->assertSame('google.user@example.com', Auth::user()->email);
    $this->assertSame('google-user-id', Auth::user()->google_id);
    $response->assertRedirect(route('dashboard', absolute: false));
});

test('users can not authenticate with google when account is not registered', function () {
    $googleUser = new \Laravel\Socialite\Two\User();
    $googleUser->id = 'google-unregistered-id';
    $googleUser->email = 'google.unregistered@example.com';
    $googleUser->name = 'Google Unregistered';
    $googleUser->avatar = 'https://example.com/avatar-unregistered.jpg';
    $googleUser->token = 'token';

    Socialite::shouldReceive('driver')->with('google')->andReturnSelf();
    Socialite::shouldReceive('user')->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $this->assertGuest();
    $response->assertRedirect(route('login', absolute: false));
    $response->assertSessionHasErrors('email');
    $this->assertDatabaseMissing('users', [
        'email' => 'google.unregistered@example.com',
    ]);
});

test('google callback falls back to stateless flow when oauth state is invalid', function () {
    User::factory()->create([
        'email' => 'google.fallback@example.com',
    ]);

    $googleUser = new \Laravel\Socialite\Two\User();
    $googleUser->id = 'google-fallback-id';
    $googleUser->email = 'google.fallback@example.com';
    $googleUser->name = 'Google Fallback';
    $googleUser->avatar = 'https://example.com/avatar-fallback.jpg';
    $googleUser->token = 'token';

    $provider = \Mockery::mock();

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
    $provider->shouldReceive('user')->once()->andThrow(new InvalidStateException());
    $provider->shouldReceive('stateless')->once()->andReturnSelf();
    $provider->shouldReceive('user')->once()->andReturn($googleUser);

    $response = $this->get('/auth/google/callback');

    $this->assertAuthenticated();
    $this->assertSame('google.fallback@example.com', Auth::user()->email);
    $this->assertSame('google-fallback-id', Auth::user()->google_id);
    $response->assertRedirect(route('dashboard', absolute: false));
});
