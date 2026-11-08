import { Routes } from '@angular/router';
import { Pedido } from './pedido/pedido';
import { Ventas } from './ventas/ventas';
import { Consultas } from './consultas/consultas';

export const routes: Routes = [
  { path: '', redirectTo: 'pedido', pathMatch: 'full' },
  { path: 'pedido', component: Pedido },
  { path: 'ventas', component: Ventas },
  { path: 'consultas', component: Consultas }
];