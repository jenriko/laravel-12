<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboarController extends Controller
{
    public function __invoke()
    {
        return inertia('dashboard');
    }
}
