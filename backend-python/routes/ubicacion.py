from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Esto habilita CORS para todas las rutas

@app.route('/api/ubicacion')
def ubicacion():
    data = {
        "ciudad": "Pachuca de Soto",
        "descripcion": "Sucursal principal en Pachuca de Soto",
        "latitud": 20.12,
        "longitud": -98.74
    }
    return jsonify(data)

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000)
