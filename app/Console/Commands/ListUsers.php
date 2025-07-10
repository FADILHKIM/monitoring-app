<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;

class ListUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:list';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List all users in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $users = User::all();
        
        if ($users->isEmpty()) {
            $this->info('No users found in the database.');
            return 0;
        }
        
        $this->info('Users in database:');
        $this->line('');
        
        foreach ($users as $user) {
            $this->line("ID: {$user->id}");
            $this->line("Name: {$user->name}");
            $this->line("Email: {$user->email}");
            $this->line("Status: {$user->status}");
            $this->line("Role: {$user->role}");
            $this->line("Created: {$user->created_at}");
            $this->line('---');
        }
        
        return 0;
    }
}
