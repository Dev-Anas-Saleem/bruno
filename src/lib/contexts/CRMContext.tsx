'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Cliente {
  _id: string;
  nombre: string;
  telefono: string;
  direccion?: string;
  necesidades?: string;
  fechaCreacion: string;
  ultimaModificacion: string;
}

interface Empleado {
  _id: string;
  nombre: string;
  equipo: string;
  equipoTemporal?: string;
  comision: number;
  ultimaComision: string;
  fechaCreacion: string;
  ultimaModificacion: string;
}

interface Equipo {
  _id: string;
  nombre: string;
  color: string;
  members: string[];
  fechaCreacion: string;
  ultimaModificacion: string;
}

export interface Tarea {
  _id: string;
  titulo: string;
  descripcion: string;
  estado: 'pendiente' | 'completada' | 'vencida';
  equipoId: string;
  comision: number;
  fecha: string;
  observaciones: string;
  montoCobrado?: number;
  metodoPago?: 'efectivo' | 'tarjeta';
  fechaCreacion: string;
  ultimaModificacion: string;
}

export interface CRMContextType {
  clientes: Cliente[];
  empleados: Empleado[];
  equipos: Equipo[];
  tareas: Tarea[];
  agregarCliente: (cliente: Omit<Cliente, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => Promise<void>;
  agregarEmpleado: (empleado: Omit<Empleado, 'id' | 'fechaCreacion' | 'ultimaModificacion' | 'ultimaComision'>) => Promise<void>;
  agregarEquipo: (equipo: Omit<Equipo, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => Promise<void>;
  agregarTarea: (tarea: Omit<Tarea, 'id' | 'estado' | 'observaciones' | 'fechaCreacion' | 'ultimaModificacion'>) => Promise<void>;
  actualizarEmpleado: (id: string, datos: Partial<Empleado>) => Promise<void>;
  actualizarTarea: (id: string, datos: Partial<Tarea>) => Promise<void>;
  eliminarEquipo: (id: string) => Promise<void>;
  eliminarTarea: (id: string) => Promise<void>;
  buscarClientePorNombre: (nombre: string) => Promise<Cliente[]>;
  agregarMiembroEquipo: (equipoId: string, empleadoId: string) => Promise<void>;
  removerMiembroEquipo: (equipoId: string, empleadoId: string) => Promise<void>;
  obtenerMiembrosEquipo: (equipoId: string) => Promise<string[]>;
}

export const CRMContext = createContext<CRMContextType>({
  clientes: [],
  empleados: [],
  equipos: [],
  tareas: [],
  agregarCliente: async () => { },
  agregarEmpleado: async () => { },
  agregarEquipo: async () => { },
  agregarTarea: async () => { },
  actualizarEmpleado: async () => { },
  actualizarTarea: async () => { },
  eliminarEquipo: async () => { },
  eliminarTarea: async () => { },
  buscarClientePorNombre: async () => [],
  agregarMiembroEquipo: async () => { },
  removerMiembroEquipo: async () => { },
  obtenerMiembrosEquipo: async () => []
});

export function CRMProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [tareas, setTareas] = useState<Tarea[]>([]);

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Using query parameter "model" to fetch records.
        const [clientesRes, empleadosRes, equiposRes, tareasRes] = await Promise.all([
          fetch('/api/crm?model=cliente'),
          fetch('/api/crm?model=empleado'),
          fetch('/api/crm?model=equipo'),
          fetch('/api/crm?model=tarea')
        ]);

        const { result: clientesResult } = await clientesRes.json();
        const { result: empleadosResult } = await empleadosRes.json();
        const { result: equiposResult } = await equiposRes.json();
        const { result: tareasResult } = await tareasRes.json();

        if (clientesRes.ok) setClientes(clientesResult);
        if (empleadosRes.ok) setEmpleados(empleadosResult);
        if (equiposRes.ok) setEquipos(equiposResult);
        if (tareasRes.ok) {
          setTareas(
            tareasResult.map((tarea: Tarea) => {
              const fechaTarea = new Date(tarea.fecha);
              if (tarea.estado === 'pendiente' && fechaTarea < new Date()) {
                return { ...tarea, estado: 'vencida' };
              }
              return tarea;
            })
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // All functions below now use the API.

  const agregarCliente = async (cliente: Omit<Cliente, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'cliente', data: cliente })
      });
      if (response.ok) {
        const { result: nuevoCliente } = await response.json();
        setClientes((prev) => [...prev, nuevoCliente]);
      }
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  const agregarEmpleado = async (empleado: Omit<Empleado, 'id' | 'fechaCreacion' | 'ultimaModificacion' | 'ultimaComision'>) => {
    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'empleado', data: empleado })
      });
      if (response.ok) {
        const { result: nuevoEmpleado } = await response.json();
        setEmpleados((prev) => [...prev, nuevoEmpleado]);
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const agregarEquipo = async (equipo: Omit<Equipo, 'id' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'equipo', data: equipo })
      });
      if (response.ok) {
        const { result: nuevoEquipo } = await response.json();
        console.log(nuevoEquipo)
        setEquipos((prev) => [...prev, nuevoEquipo]);
      }
    } catch (error) {
      console.error('Error adding team:', error);
    }
  };

  const agregarTarea = async (tarea: Omit<Tarea, 'id' | 'estado' | 'observaciones' | 'fechaCreacion' | 'ultimaModificacion'>) => {
    try {
      // Set defaults for estado and observaciones.
      const bodyData = { ...tarea, estado: 'pendiente', observaciones: '' };
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'tarea', data: bodyData })
      });
      if (response.ok) {
        const { result: nuevaTarea } = await response.json();
        setTareas((prev) => [...prev, nuevaTarea]);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const actualizarEmpleado = async (id: string, datos: Partial<Empleado>) => {
    try {
      const response = await fetch(`/api/crm/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: datos })
      });
      if (response.ok) {
        const empleadoActualizado = await response.json();
        setEmpleados((prev) =>
          prev.map((emp) => (emp._id === id ? empleadoActualizado : emp))
        );
      }
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const actualizarTarea = async (id: string, datos: Partial<Tarea>) => {
    try {
      const response = await fetch(`/api/crm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'tarea', id, data: datos })
      });
      if (response.ok) {
        const { result: tareaActualizada } = await response.json();
        setTareas((prev) =>
          prev.map((tarea) => (tarea._id === id ? tareaActualizada : tarea))
        );
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }  

  const eliminarEquipo = async (id: string) => {
    try {
      const response = await fetch(`/api/crm?model=equipo&id=${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setEquipos((prev) => prev.filter((eq) => eq._id !== id));
        // Also update employees that belonged to this team.
        setEmpleados((prev) =>
          prev.map((emp) =>
            emp.equipo === id
              ? { ...emp, equipo: '', ultimaModificacion: new Date().toISOString() }
              : emp
          )
        );
      }
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const eliminarTarea = async (id: string) => {
    try {
      const response = await fetch(`/api/crm?model=tarea&id=${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setTareas((prev) => prev.filter((tarea) => tarea._id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const buscarClientePorNombre = async (nombre: string): Promise<Cliente[]> => {
    try {
      // Use the new endpoint with action=buscar.
      const response = await fetch(
        `/api/crm?model=cliente&action=buscar&nombre=${encodeURIComponent(nombre)}`
      );
      if (response.ok) {
        const { result } = await response.json();
        return result;
      }
      return [];
    } catch (error) {
      console.error('Error searching clients:', error);
      return [];
    }
  };
  
  

  // Updated: Use API with model "equipo" and an action value.
  const agregarMiembroEquipo = async (equipoId: string, empleadoId: string) => {
    try {
      console.log(equipoId, empleadoId)
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'equipo',
          action: 'addMember',
          data: { equipoId, empleadoId }
        })
      });
      if (response.ok) {
        const { result } = await response.json();
        // result contains the updated equipo and empleado records.
        setEquipos((prev) => prev.map((eq) => (eq._id === result.equipo._id ? result.equipo : eq)));
        setEmpleados((prev) => prev.map((emp) => (emp._id === result.empleado._id ? result.empleado : emp)));
      }
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  };

  const removerMiembroEquipo = async (equipoId: string, empleadoId: string) => {
    try {
      const response = await fetch('/api/crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'equipo',
          action: 'removeMember',
          data: { equipoId, empleadoId }
        })
      });
      if (response.ok) {
        const { result } = await response.json();
        setEquipos((prev) => prev.map((eq) => (eq._id === result.equipo._id ? result.equipo : eq)));
        setEmpleados((prev) => prev.map((emp) => (emp._id === result.empleado._id ? result.empleado : emp)));
      }
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  };

  const obtenerMiembrosEquipo = async (equipoId: string): Promise<string[]> => {
    try {
      const response = await fetch(`/api/crm?model=equipo&id=${equipoId}&action=getMembers`, {
        method: 'GET'
      });
      if (response.ok) {
        const { result } = await response.json();
        // result is expected to be an object with a "members" array.
        return result.members;
      }
      return [];
    } catch (error) {
      console.error('Error getting team members:', error);
      return [];
    }
  };

  return (
    <CRMContext.Provider
      value={{
        clientes,
        empleados,
        equipos,
        tareas,
        agregarCliente,
        agregarEmpleado,
        agregarEquipo,
        agregarTarea,
        actualizarEmpleado,
        actualizarTarea,
        eliminarEquipo,
        eliminarTarea,
        buscarClientePorNombre,
        agregarMiembroEquipo,
        removerMiembroEquipo,
        obtenerMiembrosEquipo
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  return useContext(CRMContext);
}
