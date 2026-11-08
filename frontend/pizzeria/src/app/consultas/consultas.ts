
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Pizzeria } from '../servicios/pizzeria';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [FormsModule, CurrencyPipe],
  templateUrl: './consultas.html'
})
export class Consultas {

  dia = 'lunes';
  mes = 'noviembre';

  ventasDia: any[] = [];
  ventasMes: any[] = [];

  totalDia = 0;
  totalMes = 0;

  cantidadDia = 0;
  cantidadMes = 0;

  constructor(private servicio: Pizzeria) {}

  consultarDia() {
    this.servicio.consultarVentasDia(this.dia).subscribe({
      next: (respuesta: any) => {
        this.ventasDia = respuesta.ventas;
        this.totalDia = respuesta.total_acumulado;
        this.cantidadDia = respuesta.cantidad;
      },
      error: (error) => {
        console.error(error);
        alert('Error al consultar las ventas del día');
      }
    });
  }

  consultarMes() {
    this.servicio.consultarVentasMes(this.mes).subscribe({
      next: (respuesta: any) => {
        this.ventasMes = respuesta.ventas;
        this.totalMes = respuesta.total_acumulado;
        this.cantidadMes = respuesta.cantidad;
      },
      error: (error) => {
        console.error(error);
        alert('Error al consultar las ventas del mes');
      }
    });
  }
}
