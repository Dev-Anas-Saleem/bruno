import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { Cliente, Empleado, Equipo, Tarea } from '@/lib/models/CRM';

// POST handler: Handles generic creation and special actions for teams.
export async function POST(req: Request) {
  try {
    await connectDB();
    const { model, action, data } = await req.json();

    // TEAM MEMBER OPERATIONS for "equipo"
    if (model === 'equipo' && action === 'addMember') {
      const { equipoId, empleadoId } = data;
      console.log(data)
      const equipo = await Equipo.findById(equipoId);
      if (!equipo) return NextResponse.json({ error: 'Equipo not found' }, { status: 404 });
      if (!equipo.members.includes(empleadoId)) {
        equipo.members.push(empleadoId);
        equipo.ultimaModificacion = new Date();
        await equipo.save();
      }
      const empleado = await Empleado.findById(empleadoId);
      return NextResponse.json({ result: { equipo, empleado } });
    }
    if (model === 'equipo' && action === 'removeMember') {
      const { equipoId, empleadoId } = data;
      const equipo = await Equipo.findById(equipoId);
      if (!equipo) return NextResponse.json({ error: 'Equipo not found' }, { status: 404 });
      equipo.members = equipo.members.filter((m: string) => m !== empleadoId);
      equipo.ultimaModificacion = new Date();
      await equipo.save();
      const empleado = await Empleado.findById(empleadoId);
      return NextResponse.json({ result: { equipo, empleado } });
    }

    // GENERIC CREATION
    let result;
    switch (model) {
      case 'cliente':
        result = await Cliente.create(data);
        break;
      case 'empleado':
        result = await Empleado.create(data);
        break;
      case 'equipo':
        result = await Equipo.create(data);
        break;
      case 'tarea':
        result = await Tarea.create(data);
        break;
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in POST /api/crm:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PATCH handler: For updating empleados, tareas, or teams.
export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { model, id, data } = await req.json();
    let result;
    switch (model) {
      case 'empleado':
        result = await Empleado.findByIdAndUpdate(id, data, { new: true });
        break;
      case 'equipo':
        result = await Equipo.findByIdAndUpdate(id, data, { new: true });
        break;
      case 'tarea':
        result = await Tarea.findByIdAndUpdate(id, data, { new: true });
        break;
      default:
        return NextResponse.json({ error: 'Invalid model for PATCH' }, { status: 400 });
    }
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in PATCH /api/crm:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


// PUT handler: A generic update (if needed).
export async function PUT(req: Request) {
  try {
    await connectDB();
    const { model, id, data } = await req.json();
    let result;
    switch (model) {
      case 'cliente':
        result = await Cliente.findByIdAndUpdate(id, data, { new: true });
        break;
      case 'empleado':
        result = await Empleado.findByIdAndUpdate(id, data, { new: true });
        break;
      case 'equipo':
        result = await Equipo.findByIdAndUpdate(id, data, { new: true });
        break;
      case 'tarea':
        result = await Tarea.findByIdAndUpdate(id, data, { new: true });
        break;
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in PUT /api/crm:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE handler: Supports generic deletion via query parameters.
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const model = url.searchParams.get('model');
    const id = url.searchParams.get('id');
    if (!model || !id) {
      return NextResponse.json({ error: 'Model or id missing' }, { status: 400 });
    }
    let result;
    switch (model) {
      case 'cliente':
        result = await Cliente.findByIdAndDelete(id);
        break;
      case 'empleado':
        result = await Empleado.findByIdAndDelete(id);
        break;
      case 'equipo':
        result = await Equipo.findByIdAndDelete(id);
        break;
      case 'tarea':
        result = await Tarea.findByIdAndDelete(id);
        break;
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in DELETE /api/crm:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // CLIENT SEARCH endpoint: check if action is 'buscar'
    if (
      searchParams.get('model') === 'cliente' &&
      searchParams.get('action') === 'buscar'
    ) {
      const nombre = searchParams.get('nombre');
      // Only error if the parameter is completely missing (null)
      if (nombre === null) {
        return NextResponse.json({ error: 'Nombre missing' }, { status: 400 });
      }
      // Use the provided string (even if empty) in the regex search.
      const results = await Cliente.find({
        nombre: { $regex: nombre, $options: 'i' }
      });
      return NextResponse.json({ result: results });
    }

    // TEAM MEMBERS endpoint:
    if (
      searchParams.get('action') === 'getMembers' &&
      searchParams.get('model') === 'equipo'
    ) {
      const equipoId = searchParams.get('id');
      if (!equipoId) {
        return NextResponse.json({ error: 'Equipo id missing' }, { status: 400 });
      }
      const equipo = await Equipo.findById(equipoId);
      if (!equipo) {
        return NextResponse.json({ error: 'Equipo not found' }, { status: 404 });
      }
      return NextResponse.json({ result: { members: equipo.members } });
    }

    // GENERIC GET via query parameter ?model=...
    const model = searchParams.get('model');
    if (!model) {
      return NextResponse.json({ error: 'Model missing' }, { status: 400 });
    }
    let result;
    switch (model) {
      case 'cliente':
        result = await Cliente.find();
        break;
      case 'empleado':
        result = await Empleado.find();
        break;
      case 'equipo':
        result = await Equipo.find();
        break;
      case 'tarea':
        result = await Tarea.find();
        break;
      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error in GET /api/crm:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

