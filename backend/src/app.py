
from flask import Flask, request
from flask_mysqldb import MySQL
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['MYSQL_HOST'] = 'localhost'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = ''
app.config['MYSQL_DB'] = 'pizzeria'

mysql = MySQL(app)

precios = {
    'Chica': 40,
    'Mediana': 80,
    'Grande': 120
}

precio_ingrediente = 10

ingredientes_disponibles = [
    'Jamon',
    'Piña',
    'Champiñones'
]

dias = {
    'domingo': 1,
    'lunes': 2,
    'martes': 3,
    'miercoles': 4,
    'miércoles': 4,
    'jueves': 5,
    'viernes': 6,
    'sabado': 7,
    'sábado': 7
}

meses = {
    'enero': 1,
    'febrero': 2,
    'marzo': 3,
    'abril': 4,
    'mayo': 5,
    'junio': 6,
    'julio': 7,
    'agosto': 8,
    'septiembre': 9,
    'octubre': 10,
    'noviembre': 11,
    'diciembre': 12
}


@app.route('/')
def inicio():
    return 'Servidor de la pizzeria funcionando correctamente'


@app.route('/conexion')
def conexion():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SHOW TABLES")
        tablas = cursor.fetchall()
        cursor.close()

        return {
            'mensaje': 'Conexion exitosa con MySQL',
            'tablas': [tabla[0] for tabla in tablas]
        }

    except Exception as e:
        return {'error': str(e)}, 500


@app.route('/precios', methods=['GET'])
def obtener_precios():
    return {
        'precios': precios,
        'precio_ingrediente': precio_ingrediente,
        'ingredientes': ingredientes_disponibles
    }


@app.route('/pedidos', methods=['POST'])
def registrar_pedido():
    try:
        datos = request.get_json()

        nombre = datos['nombre_cliente']
        direccion = datos['direccion']
        telefono = datos['telefono']
        fecha = datos['fecha_pedido']
        pizzas = datos['pizzas']

        if not pizzas:
            return {'error': 'El pedido debe tener al menos una pizza'}, 400

        total = 0

        for pizza in pizzas:
            tamano = pizza['tamano']
            ingredientes = pizza['ingredientes']
            cantidad = int(pizza['cantidad'])

            if tamano not in precios:
                return {'error': 'Tamaño de pizza no valido'}, 400

            if cantidad <= 0:
                return {'error': 'La cantidad debe ser mayor a cero'}, 400

            for ingrediente in ingredientes:
                if ingrediente not in ingredientes_disponibles:
                    return {'error': 'Ingrediente no valido'}, 400

            subtotal = (precios[tamano] + len(ingredientes) * precio_ingrediente) * cantidad
            total += subtotal

        cursor = mysql.connection.cursor()

        cursor.execute("""
            INSERT INTO pedidos
            (nombre_cliente, direccion, telefono, fecha_pedido, total)
            VALUES (%s, %s, %s, %s, %s)
        """, (nombre, direccion, telefono, fecha, total))

        id_pedido = cursor.lastrowid

        for pizza in pizzas:
            tamano = pizza['tamano']
            ingredientes = pizza['ingredientes']
            cantidad = int(pizza['cantidad'])

            if len(ingredientes) == 0:
                lista_ingredientes = 'Ninguno'
            else:
                lista_ingredientes = ', '.join(ingredientes)

            subtotal = (precios[tamano] + len(ingredientes) * precio_ingrediente) * cantidad

            cursor.execute("""
                INSERT INTO detalle_pedido
                (id_pedido, tamano, ingredientes, cantidad, subtotal)
                VALUES (%s, %s, %s, %s, %s)
            """, (id_pedido, tamano, lista_ingredientes, cantidad, subtotal))

        mysql.connection.commit()
        cursor.close()

        return {
            'mensaje': 'Pedido registrado correctamente',
            'id_pedido': id_pedido,
            'total': total
        }, 201

    except Exception as e:
        mysql.connection.rollback()
        return {'error': str(e)}, 500


@app.route('/pedidos', methods=['GET'])
def obtener_pedidos():
    try:
        cursor = mysql.connection.cursor()

        cursor.execute("""
            SELECT * FROM pedidos
            ORDER BY id_pedido DESC
        """)

        pedidos = cursor.fetchall()
        cursor.close()

        resultado = []

        for pedido in pedidos:
            resultado.append({
                'id_pedido': pedido[0],
                'nombre_cliente': pedido[1],
                'direccion': pedido[2],
                'telefono': pedido[3],
                'fecha_pedido': str(pedido[4]),
                'total': float(pedido[5])
            })

        return {'pedidos': resultado}

    except Exception as e:
        return {'error': str(e)}, 500


@app.route('/pedidos/<int:id_pedido>/detalle', methods=['GET'])
def obtener_detalle_pedido(id_pedido):
    try:
        cursor = mysql.connection.cursor()

        cursor.execute("""
            SELECT id_detalle, id_pedido, tamano, ingredientes, cantidad, subtotal
            FROM detalle_pedido
            WHERE id_pedido = %s
        """, (id_pedido,))

        filas = cursor.fetchall()
        columnas = [columna[0] for columna in cursor.description]

        detalles = [
            dict(zip(columnas, fila))
            for fila in filas
        ]

        cursor.close()

        for detalle in detalles:
            detalle['subtotal'] = float(detalle['subtotal'])

        return {'detalles': detalles}

    except Exception as e:
        return {'error': str(e)}, 500


@app.route('/ventas/dia', methods=['GET'])
def consultar_ventas_dia():
    try:
        dia = request.args.get('dia', '').lower().strip()

        if dia not in dias:
            return {'error': 'Dia de la semana no valido'}, 400

        cursor = mysql.connection.cursor()

        cursor.execute("""
            SELECT id_pedido, nombre_cliente, direccion, telefono,
                   fecha_pedido, total
            FROM pedidos
            WHERE DAYOFWEEK(fecha_pedido) = %s
            ORDER BY fecha_pedido DESC
        """, (dias[dia],))

        filas = cursor.fetchall()

        ventas = []

        for pedido in filas:
            ventas.append({
                'id_pedido': pedido[0],
                'nombre_cliente': pedido[1],
                'direccion': pedido[2],
                'telefono': pedido[3],
                'fecha_pedido': str(pedido[4]),
                'total': float(pedido[5])
            })

        total_acumulado = sum(venta['total'] for venta in ventas)

        cursor.close()

        return {
            'dia': dia,
            'ventas': ventas,
            'cantidad': len(ventas),
            'total_acumulado': total_acumulado
        }

    except Exception as e:
        return {'error': str(e)}, 500


@app.route('/ventas/mes', methods=['GET'])
def consultar_ventas_mes():
    try:
        mes = request.args.get('mes', '').lower().strip()

        if mes not in meses:
            return {'error': 'Mes no valido'}, 400

        cursor = mysql.connection.cursor()

        cursor.execute("""
            SELECT id_pedido, nombre_cliente, direccion, telefono,
                   fecha_pedido, total
            FROM pedidos
            WHERE MONTH(fecha_pedido) = %s
            ORDER BY fecha_pedido DESC
        """, (meses[mes],))

        filas = cursor.fetchall()

        ventas = []

        for pedido in filas:
            ventas.append({
                'id_pedido': pedido[0],
                'nombre_cliente': pedido[1],
                'direccion': pedido[2],
                'telefono': pedido[3],
                'fecha_pedido': str(pedido[4]),
                'total': float(pedido[5])
            })

        total_acumulado = sum(venta['total'] for venta in ventas)

        cursor.close()

        return {
            'mes': mes,
            'ventas': ventas,
            'cantidad': len(ventas),
            'total_acumulado': total_acumulado
        }

    except Exception as e:
        return {'error': str(e)}, 500


if __name__ == '__main__':
    app.run(debug=True)
