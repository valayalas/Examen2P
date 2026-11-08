import { Component } from '@angular/core';
import { Pedido } from './pedido/pedido';
import { Ventas } from './ventas/ventas';
import { Consultas } from './consultas/consultas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Pedido, Ventas, Consultas],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}