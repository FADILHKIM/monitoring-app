<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetUserPassword extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:reset-password {email} {password}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reset password for a user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            $this->error("User with email {$email} not found.");
            return 1;
        }
        
        $user->password = Hash::make($password);
        $user->status = 'active'; // Make sure status is active
        $user->save();
        
        $this->info("Password for user {$email} has been reset to: {$password}");
        $this->info("User status set to: active");
        
        return 0;
    }
}
