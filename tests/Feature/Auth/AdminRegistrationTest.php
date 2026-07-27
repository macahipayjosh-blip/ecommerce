<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Tests\TestCase;

class AdminRegistrationTest extends TestCase
{
    private string $token = 'test-admin-token';

    protected function setUp(): void
    {
        parent::setUp();
        config(['auth.admin_register_token' => $this->token]);
    }

    public function test_admin_register_page_renders_with_valid_token()
    {
        $this->get(route('admin.register.create', $this->token))
            ->assertStatus(200);
    }

    public function test_admin_register_page_is_forbidden_with_invalid_token()
    {
        $this->get(route('admin.register.create', 'wrong-token'))
            ->assertStatus(403);
    }

    public function test_admin_register_page_is_forbidden_with_no_token()
    {
        config(['auth.admin_register_token' => null]);

        $this->get(route('admin.register.create', 'anything'))
            ->assertStatus(403);
    }

    public function test_admin_can_be_created_with_valid_token()
    {
        $this->post(route('admin.register.store', $this->token), [
            'first_name'            => 'Jane',
            'last_name'             => 'Doe',
            'email'                 => 'jane@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'role'                  => 'admin',
        ])->assertRedirect(route('login'));

        $user = User::where('email', 'jane@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->hasRole('admin'));
    }

    public function test_super_admin_can_be_created_with_valid_token()
    {
        $this->post(route('admin.register.store', $this->token), [
            'first_name'            => 'Super',
            'last_name'             => 'Admin',
            'email'                 => 'super@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'role'                  => 'super_admin',
        ])->assertRedirect(route('login'));

        $this->assertTrue(
            User::where('email', 'super@example.com')->first()->hasRole('super_admin')
        );
    }

    public function test_admin_creation_fails_with_invalid_token()
    {
        $this->post(route('admin.register.store', 'bad-token'), [
            'first_name'            => 'Jane',
            'last_name'             => 'Doe',
            'email'                 => 'jane@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'role'                  => 'admin',
        ])->assertStatus(403);

        $this->assertDatabaseMissing('users', ['email' => 'jane@example.com']);
    }

    public function test_admin_creation_requires_all_fields()
    {
        $this->post(route('admin.register.store', $this->token), [])
            ->assertSessionHasErrors(['first_name', 'last_name', 'email', 'password', 'role']);
    }

    public function test_admin_creation_rejects_duplicate_email()
    {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->post(route('admin.register.store', $this->token), [
            'first_name'            => 'Jane',
            'last_name'             => 'Doe',
            'email'                 => 'taken@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'role'                  => 'admin',
        ])->assertSessionHasErrors('email');
    }

    public function test_admin_creation_rejects_non_admin_roles()
    {
        $this->post(route('admin.register.store', $this->token), [
            'first_name'            => 'Jane',
            'last_name'             => 'Doe',
            'email'                 => 'jane@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'role'                  => 'customer',
        ])->assertSessionHasErrors('role');
    }

    public function test_admin_is_not_auto_logged_in_after_registration()
    {
        $this->post(route('admin.register.store', $this->token), [
            'first_name'            => 'Jane',
            'last_name'             => 'Doe',
            'email'                 => 'jane@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'role'                  => 'admin',
        ]);

        $this->assertGuest();
    }

    public function test_authenticated_user_cannot_access_admin_register()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('admin.register.create', $this->token))
            ->assertRedirect(route('dashboard'));
    }
}
