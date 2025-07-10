<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\UserPreference;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class PreferenceController extends Controller
{
    /**
     * Display the user preferences page.
     */
    public function index()
    {
        $user = Auth::user();
        $preferences = $user->preference ? $user->preference->preferences : UserPreference::getDefaultPreferences();

        return Inertia::render('User/Preferensi', [
            'preferences' => $preferences,
        ]);
    }

    /**
     * Update user preferences.
     */
    public function update(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'preferences' => 'required|array',
        ]);

        $userPreference = $user->preference;
        
        if (!$userPreference) {
            // Create new preference record if it doesn't exist
            $userPreference = UserPreference::create([
                'user_id' => $user->id,
                'preferences' => UserPreference::getDefaultPreferences(),
            ]);
        }

        // Merge new preferences with existing ones
        $userPreference->mergePreferences($request->preferences);
        $userPreference->save();

        return response()->json([
            'message' => 'Preferensi berhasil disimpan',
            'preferences' => $userPreference->preferences,
        ]);
    }

    /**
     * Update a specific preference by key.
     */
    public function updatePreference(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'key' => 'required|string',
            'value' => 'required',
        ]);

        $userPreference = $user->preference;
        
        if (!$userPreference) {
            $userPreference = UserPreference::create([
                'user_id' => $user->id,
                'preferences' => UserPreference::getDefaultPreferences(),
            ]);
        }

        $userPreference->setPreference($request->key, $request->value);
        $userPreference->save();

        return response()->json([
            'message' => 'Preferensi berhasil diperbarui',
            'preferences' => $userPreference->preferences,
        ]);
    }

    /**
     * Reset preferences to default.
     */
    public function reset()
    {
        $user = Auth::user();
        $userPreference = $user->preference;
        
        if (!$userPreference) {
            $userPreference = UserPreference::create([
                'user_id' => $user->id,
                'preferences' => UserPreference::getDefaultPreferences(),
            ]);
        } else {
            $userPreference->resetToDefault();
            $userPreference->save();
        }

        return response()->json([
            'message' => 'Preferensi berhasil direset ke default',
            'preferences' => $userPreference->preferences,
        ]);
    }

    /**
     * Get user preferences (API endpoint).
     */
    public function getPreferences()
    {
        $user = Auth::user();
        $preferences = $user->preference ? $user->preference->preferences : UserPreference::getDefaultPreferences();

        return response()->json([
            'preferences' => $preferences,
        ]);
    }
}