import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Pizzeria } from '../servicios/pizzeria';

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './ventas.html'
})
export class Ventas implements OnInit {

  pedidos: any[] = [];
  detalles: any[] = [];
  pedidoSeleccionado: any = null;

  constructor(
    private servicio: Pizzeria,
    private detector: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.servicio.obtenerPedidos().subscribe({
      next: (respuesta: any) => {
        this.pedidos = respuesta.pedidos ?? [];
        this.detector.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar:', error);
        alert('Error al consultar los pedidos');
      }
    });
  }

  get ventasDelDia(): any[] {
    const hoy = new Date();
    const fechaHoy =
      hoy.getFullYear() + '-' +
      String(hoy.getMonth() + 1).padStart(2, '0') + '-' +
      String(hoy.getDate()).padStart(2, '0');

    return this.pedidos.filter(pedido =>
      String(pedido.fecha_pedido).substring(0, 10) === fechaHoy
    );
  }

  get cantidadVentasDia(): number {
    return this.ventasDelDia.length;
  }

  get totalVentasDia(): number {
    return this.ventasDelDia.reduce(
      (total, pedido) => total + Number(pedido.total || 0),
      0
    );
  }

  verDetalle(pedido: any) {
    this.pedidoSeleccionado = pedido;
    this.detalles = [];

    this.servicio.obtenerDetallePedido(pedido.id_pedido).subscribe({
      next: (respuesta: any) => {
        this.detalles = respuesta.detalles ?? [];
        this.detector.detectChanges();
      },
      error: (error) => {
        console.error('Error al consultar el detalle:', error);
        alert('Error al consultar el detalle del pedido');
      }
    });
  }

  cerrarDetalle() {
    this.pedidoSeleccionado = null;
    this.detalles = [];
  }
}