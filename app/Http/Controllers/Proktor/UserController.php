<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController
{
    public function index()
    {
        $users = \App\Models\User::with('classroom')->latest()->paginate(10);
        $classrooms = \App\Models\Classroom::all();
        return \Inertia\Inertia::render('Proktor/Users/Index', [
            'users' => $users,
            'classrooms' => $classrooms
        ]);
    }

    public function create()
    {
        $classrooms = \App\Models\Classroom::all();
        return \Inertia\Inertia::render('Proktor/Users/Create', [
            'classrooms' => $classrooms
        ]);
    }

    public function importStudents(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv',
            'classroom_id' => 'required|exists:classrooms,id',
        ]);

        \Maatwebsite\Excel\Facades\Excel::import(
            new \App\Imports\StudentsImport($request->classroom_id),
            $request->file('file')
        );

        return redirect()->route('proktor.users.index')->with('success', 'Students imported successfully.');
    }

    public function store(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:users',
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:proktor,guru,siswa',
            'classroom_id' => 'required_if:role,siswa|nullable|exists:classrooms,id',
        ]);

        \App\Models\User::create([
            'username' => $request->username,
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
            'role' => $request->role,
            'classroom_id' => $request->classroom_id,
        ]);

        return redirect()->route('proktor.users.index')->with('success', 'User created successfully.');
    }

    public function edit($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $classrooms = \App\Models\Classroom::all();
        return \Inertia\Inertia::render('Proktor/Users/Edit', [
            'user' => $user,
            'classrooms' => $classrooms
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = \App\Models\User::findOrFail($id);
        $request->validate([
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'name' => 'required|string|max:255',
            'email' => 'nullable|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:proktor,guru,siswa',
            'classroom_id' => 'required_if:role,siswa|nullable|exists:classrooms,id',
        ]);

        $data = $request->only('username', 'name', 'email', 'role', 'classroom_id');
        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        return redirect()->route('proktor.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy($id)
    {
        $user = \App\Models\User::findOrFail($id);
        $user->delete();

        return redirect()->route('proktor.users.index')->with('success', 'User deleted successfully.');
    }
}
