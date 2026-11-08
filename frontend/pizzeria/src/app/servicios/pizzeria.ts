
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class Pizzeria {

  private api = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  obtenerPrecios() {
    return this.http.get<any>(this.api + '/precios');
  }

  registrarPedido(datos: any) {
    return this.http.post<any>(this.api + '/pedidos', datos);
  }

  obtenerPedidos() {
    return this.http.get<any>(this.api + '/pedidos');
  }

  obtenerDetallePedido(id: number) {
    return this.http.get<any>(this.api + '/pedidos/' + id + '/detalle');
  }

  consultarVentasDia(dia: string) {
    return this.http.get<any>(this.api + '/ventas/dia?dia=' + dia);
  }

  consultarVentasMes(mes: string) {
    return this.http.get<any>(this.api + '/ventas/mes?mes=' + mes);
  }
}

