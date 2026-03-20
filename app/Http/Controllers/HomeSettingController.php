<?php
namespace App\Http\Controllers;

use App\Models\HomeSetting;
use Illuminate\Http\Request;

class HomeSettingController extends Controller
{
    public function show() {
        return HomeSetting::first(); // Берем единственную запись
    }

    public function update(Request $request) {
        // ПРОВЕРКА РОЛИ
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $settings = HomeSetting::first();
        $settings->update($request->all());
        
        return $settings;
    }
}