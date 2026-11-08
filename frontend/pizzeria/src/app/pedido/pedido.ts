import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Pizzeria } from '../servicios/pizzeria';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './pedido.html'
})
export class Pedido implements OnInit {

  nombre = '';
  direccion = '';
  telefono = '';
  fecha = '';

  tamano = 'Chica';
  ingredientes: string[] = [];
  cantidad = 1;

  precios: any = {};
  precioIngrediente = 10;

  pizzas: any[] = [];

  constructor(private servicio: Pizzeria) {}

  ngOnInit() {
    this.servicio.obtenerPrecios().subscribe({
      next: (respuesta: any) => {
        this.precios = respuesta.precios;
        this.precioIngrediente = respuesta.precio_ingrediente;
      },
      error: (error) => {
        console.error(error);
        alert('Error al obtener los precios');
      }
    });
  }

  seleccionarIngrediente(ingrediente: string, evento: any) {
    if (evento.target.checked) {
      if (!this.ingredientes.includes(ingrediente)) {
        this.ingredientes.push(ingrediente);
      }
    } else {
      this.ingredientes = this.ingredientes.filter(
        i => i !== ingrediente
      );
    }
  }

  calcularSubtotal(tamano: string, ingredientes: string[], cantidad: number) {
    const precio = Number(this.precios[tamano] || 0);
    return (precio + ingredientes.length * this.precioIngrediente) * cantidad;
  }

  agregar() {
    if (!this.tamano) {
      alert('Selecciona un tamaño de pizza');
      return;
    }

    if (
      !Number.isInteger(Number(this.cantidad)) ||
      Number(this.cantidad) < 1
    ) {
      alert('Ingresa una cantidad válida');
      return;
    }

    const nuevaPizza = {
      tamano: this.tamano,
      ingredientes: [...this.ingredientes],
      cantidad: Number(this.cantidad),
      subtotal: this.calcularSubtotal(
        this.tamano,
        this.ingredientes,
        Number(this.cantidad)
      )
    };

    this.pizzas.push(nuevaPizza);

    this.tamano = 'Chica';
    this.ingredientes = [];
    this.cantidad = 1;
  }

  quitar(indice: number) {
    this.pizzas.splice(indice, 1);
  }

  get totalPedido(): number {
    return this.pizzas.reduce(
      (total, pizza) => total + pizza.subtotal,
      0
    );
  }

  terminar() {
    if (
      !this.nombre.trim() ||
      !this.direccion.trim() ||
      !this.telefono.trim() ||
      !this.fecha
    ) {
      alert('Completa todos los datos del cliente');
      return;
    }

    if (this.pizzas.length === 0) {
      alert('Agrega al menos una pizza al pedido');
      return;
    }

    const datos = {
      nombre_cliente: this.nombre,
      direccion: this.direccion,
      telefono: this.telefono,
      fecha_pedido: this.fecha,
      pizzas: this.pizzas.map(pizza => ({
        tamano: pizza.tamano,
        ingredientes: pizza.ingredientes,
        cantidad: pizza.cantidad
      }))
    };

    this.servicio.registrarPedido(datos).subscribe({
      next: (respuesta: any) => {
        alert(
          respuesta.mensaje +
          '\nNúmero de pedido: ' + respuesta.id_pedido +
          '\nTotal: $' + respuesta.total
        );

        this.nombre = '';
        this.direccion = '';
        this.telefono = '';
        this.fecha = '';
        this.tamano = 'Chica';
        this.ingredientes = [];
        this.cantidad = 1;
        this.pizzas = [];
      },
      error: (error) => {
        console.error(error);
        alert(error.error?.error || 'Error al registrar el pedido');
      }
    });
  }
}
