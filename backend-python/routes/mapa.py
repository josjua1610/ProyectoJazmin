import folium

def generar_mapa_pachuca():
    lat, lon = 20.12, -98.74
    mapa = folium.Map(location=[lat, lon], zoom_start=13)
    folium.Marker([lat, lon], popup="Pachuca de Soto").add_to(mapa)
    archivo_html = "mapa_pachuca.html"
    mapa.save(archivo_html)
    print(f"Mapa generado en {archivo_html}")

if __name__ == "__main__":
    generar_mapa_pachuca()
