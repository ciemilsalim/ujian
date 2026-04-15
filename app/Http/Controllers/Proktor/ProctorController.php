<?php

namespace App\Http\Controllers\Proktor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Proctor;
use Inertia\Inertia;

class ProctorController extends Controller
{
    public function index()
    {
        return Inertia::render('Proktor/Proctors/Index', [
            'proctors' => Proctor::latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nip' => 'nullable|string|max:255',
        ]);

        $data = $request->all();
        $pin = str_pad((string)mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        while (Proctor::where('pin', $pin)->exists()) {
            $pin = str_pad((string)mt_rand(0, 999999), 6, '0', STR_PAD_LEFT);
        }
        $data['pin'] = $pin;

        Proctor::create($data);

        return redirect()->back()->with('success', 'Pengawas berhasil ditambahkan.');
    }

    public function update(Request $request, Proctor $proctor)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'nip' => 'nullable|string|max:255',
        ]);

        $proctor->update($request->all());

        return redirect()->back()->with('success', 'Data pengawas berhasil diperbarui.');
    }

    public function destroy(Proctor $proctor)
    {
        $proctor->delete();
        return redirect()->back()->with('success', 'Data pengawas berhasil dihapus.');
    }
}
