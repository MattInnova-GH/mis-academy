import { useState, useEffect, useCallback } from "react";
import { apiUrl } from "../config/api";
import "./reclamaciones_ii.css";

// ---------------------------------------------------------------------------
// Data de departamentos / provincias / distritos (Perú)
// ---------------------------------------------------------------------------
const PERU_DATA: Record<
    string,
    { provincias: string[]; distritos: Record<string, string[]> }
> = {
    'Cusco': {
        provincias: ['Cusco', 'Acomayo', 'Anta', 'Calca', 'Canas', 'Canchis', 'Chumbivilcas', 'Espinar', 'Paruro', 'Paucartambo', 'Quispicanchi', 'Urubamba'],
        distritos: {
            'Cusco': ['Cusco', 'Ccorca', 'Poroy', 'San Jerónimo', 'San Sebastián', 'Santiago', 'Saylla', 'Wanchaq'],
            'Acomayo': ['Acomayo', 'Acopia', 'Acos', 'Mosoc Llacta', 'Pomacanchi', 'Rondocan', 'Sangarará'],
            'Anta': ['Anta', 'Ancahuasi', 'Cachimayo', 'Chinchaypujio', 'Huarocondo', 'Limatambo', 'Mollepata', 'Pucyura', 'Zurite'],
            'Calca': ['Calca', 'Coya', 'Lamay', 'Lares', 'Pisac', 'San Salvador', 'Taray', 'Yanatile'],
            'Canas': ['Yanaoca', 'Checca', 'Kunturkanki', 'Langui', 'Layo', 'Pampamarca', 'Quehue', 'Tupac Amaru'],
            'Canchis': ['Sicuani', 'Checacupe', 'Combapata', 'Maranganí', 'Pitumarca', 'San Pablo', 'San Pedro', 'Tinta'],
            'Chumbivilcas': ['Santo Tomás', 'Capacmarca', 'Chamaca', 'Colquemarca', 'Livitaca', 'Llusco', 'Quiñota', 'Velille'],
            'Espinar': ['Yauri', 'Alto Pichigua', 'Coporaque', 'Espinar', 'Ocoruro', 'Pallpata', 'Pichigua', 'Suyckutambo'],
            'Paruro': ['Paruro', 'Accha', 'Ccapi', 'Colcha', 'Huanoquite', 'Omacha', 'Paccaritambo', 'Pillpinto', 'Yaurisque'],
            'Paucartambo': ['Paucartambo', 'Caicay', 'Challabamba', 'Colquepata', 'Huancarani', 'Kosñipata'],
            'Quispicanchi': ['Urcos', 'Andahuaylillas', 'Camanti', 'Ccarhuayo', 'Ccatca', 'Cusipata', 'Huaro', 'Lucre', 'Marcapata', 'Ocongate', 'Oropesa', 'Quiquijana'],
            'Urubamba': ['Urubamba', 'Chinchero', 'Huayllabamba', 'Machu Picchu', 'Ollantaytambo', 'Yucay'],
        }
    },
    'Lima': {
        provincias: ['Lima', 'Barranca', 'Cajatambo', 'Cañete', 'Huaral', 'Huarochirí', 'Huaura', 'Oyón', 'Yauyos'],
        distritos: {
            'Lima': ['Lima', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Comas', 'El Agustino', 'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lince', 'Los Olivos', 'Lurín', 'Magdalena del Mar', 'Miraflores', 'Puente Piedra', 'Rímac', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores', 'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santiago de Surco', 'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'],
            'Barranca': ['Barranca', 'Paramonga', 'Pativilca', 'Supe', 'Supe Puerto'],
            'Cajatambo': ['Cajatambo', 'Copa', 'Gorgor', 'Huancapón', 'Manas'],
            'Cañete': ['San Vicente de Cañete', 'Asia', 'Calango', 'Cerro Azul', 'Chilca', 'Coayllo', 'Imperial', 'Lunahuaná', 'Mala', 'Nuevo Imperial', 'Omas', 'Pacarán', 'Quilmaná', 'San Antonio', 'San Luis', 'Santa Cruz de Flores', 'Zúñiga'],
            'Huaral': ['Huaral', 'Atavillos Alto', 'Atavillos Bajo', 'Aucallama', 'Chancay', 'Ihuarí', 'Lampián', 'Pacaraos', 'San Miguel de Acos', 'Santa Cruz de Andamarca', 'Sumbilca', 'Veintisiete de Noviembre'],
            'Huarochirí': ['Matucana', 'Antioquía', 'Callahuanca', 'Carampoma', 'Chicla', 'Cuenca', 'Huachupampa', 'Huanza', 'Huarochirí', 'Lahuaytambo', 'Langa', 'Laraos', 'Mariatana', 'Ricardo Palma', 'San Andrés de Tupicocha', 'San Antonio', 'San Damián', 'San Juan de Iris', 'San Lorenzo de Quinti', 'San Mateo', 'San Mateo de Otao', 'San Pedro de Casta', 'San Pedro de Huancayre', 'Sangallaya', 'Santa Cruz de Cocachacra', 'Santa Eulalia', 'Santiago de Anchucaya', 'Santiago de Tuna', 'Santo Domingo de Los Olleros', 'Surco'],
            'Huaura': ['Huacho', 'Ambar', 'Caleta de Carquín', 'Checras', 'Hualmay', 'Huaura', 'Leoncio Prado', 'Paccho', 'Santa Leonor', 'Santa María', 'Sayán', 'Vegueta'],
            'Oyón': ['Oyón', 'Andajes', 'Caujul', 'Cochamarca', 'Naván', 'Pachangara'],
            'Yauyos': ['Yauyos', 'Alis', 'Allauca', 'Ayavirí', 'Azángaro', 'Cacra', 'Carania', 'Catahuasi', 'Chocos', 'Cochas', 'Colonia', 'Hongos', 'Huampará', 'Huancaya', 'Huangáscar', 'Huantán', 'Laraos', 'Lincha', 'Madean', 'Miraflores', 'Omas', 'Putinza', 'Quinches', 'San Joaquín', 'San Pedro de Pilas', 'Tanta', 'Tauripampa', 'Tomas', 'Tupe', 'Viñac', 'Vitis'],
        }
    },
    'Arequipa': {
        provincias: ['Arequipa', 'Camaná', 'Caravelí', 'Castilla', 'Caylloma', 'Condesuyos', 'Islay', 'La Unión'], distritos: {
            'Arequipa': ['Arequipa', 'Alto Selva Alegre', 'Cayma', 'Cerro Colorado', 'Characato', 'Chiguata', 'Jacobo Hunter', 'La Joya', 'Mariano Melgar', 'Miraflores', 'Mollebaya', 'Paucarpata', 'Pocsi', 'Polobaya', 'Quequeña', 'Sabandía', 'Sachaca', 'San Juan de Siguas', 'San Juan de Tarucani', 'Santa Isabel de Siguas', 'Santa Rita de Siguas', 'Socabaya', 'Tiabaya', 'Uchumayo', 'Vítor', 'Yanahuara', 'Yarabamba', 'Yura'],
            'Camaná': ['Camaná', 'José María Quimper', 'Mariano Nicolás Valcárcel', 'Mariscal Cáceres', 'Nicolás de Piérola', 'Ocoña', 'Quilca', 'Samuel Pastor'],
            'Caravelí': ['Caravelí', 'Acarí', 'Atico', 'Atiquipa', 'Bella Unión', 'Cahuacho', 'Chala', 'Chaparra', 'Huanuhuanu', 'Jaqui', 'Lomas', 'Quicacha', 'Yauca'],
            'Castilla': ['Aplao', 'Andagua', 'Ayo', 'Chachas', 'Chichas', 'Choco', 'Huancarqui', 'Machaguay', 'Orcopampa', 'Pampacolca', 'Puyca', 'Tipan', 'Uñon', 'Uraca', 'Viraco'],
            'Caylloma': ['Chivay', 'Achoma', 'Cabanaconde', 'Callalli', 'Caylloma', 'Coporaque', 'Huambo', 'Huanca', 'Ichupampa', 'Lari', 'Lluta', 'Maca', 'Madrigal', 'San Antonio de Chuca', 'Sibayo', 'Tapay', 'Tisco', 'Tuti', 'Yanque', 'Majes'],
            'Condesuyos': ['Chuquibamba', 'Andaray', 'Cayarani', 'Chichas', 'Iray', 'Rio Grande', 'Salamanca', 'Yanaquihua'],
            'Islay': ['Mollendo', 'Cocachacra', 'Dean Valdivia', 'Islay', 'Mejía', 'Punta de Bombón'],
            'La Unión': ['Cotahuasi', 'Alca', 'Charcana', 'Huaynacotas', 'Pampamarca', 'Puyca', 'Quechualla', 'Sayla', 'Tauria', 'Tomepampa', 'Toro'],
        }
    },
    'Ayacucho': {
        provincias: ['Huamanga', 'Cangallo', 'Huanca Sancos', 'Huanta', 'La Mar', 'Lucanas', 'Parinacochas', 'Páucar del Sara Sara', 'Sucre', 'Víctor Fajardo', 'Vilcas Huamán'], distritos: {
            'Huamanga': ['Ayacucho', 'Acocro', 'Acos Vinchos', 'Carmen Alto', 'Chiara', 'Jesús Nazareno', 'Ocros', 'Pacaycasa', 'Quinua', 'San José de Ticllas', 'San Juan Bautista', 'Santiago de Pischa', 'Socos', 'Tambillo', 'Vinchos'],
            'Cangallo': ['Cangallo', 'Chuschi', 'Los Morochucos', 'María Parado de Bellido', 'Paras', 'Totos'],
            'Huanca Sancos': ['Carapo', 'Sacsamarca', 'Sancos', 'Santiago de Lucanamarca'],
            'Huanta': ['Huanta', 'Ayahuanco', 'Iguaín', 'Llochegua', 'Luricocha', 'Pucacolpa', 'Santillana', 'Sivia', 'Uchuraccay'],
            'La Mar': ['San Miguel', 'Anco', 'Ayna', 'Chilcas', 'Chungui', 'Luis Carranza', 'Santa Rosa', 'Tambo'],
            'Lucanas': ['Puquio', 'Aucara', 'Cabana', 'Carmen Salcedo', 'Chaviña', 'Chipao', 'Huac-Huas', 'Laramate', 'Leoncio Prado', 'Llauta', 'Lucanas', 'Ocaña', 'Otoca', 'Saisa', 'San Cristóbal', 'San Juan', 'San Pedro', 'Sancos', 'Santa Lucia'],
            'Parinacochas': ['Coracora', 'Chumpi', 'Coronel Castañeda', 'Pacapausa', 'Puyusca', 'San Francisco de Rivacayco', 'Upahuacho'],
            'Páucar del Sara Sara': ['Pausa', 'Colta', 'Corculla', 'Lampa', 'Marcabamba', 'Oyolo', 'Pararca', 'Sara Sara'],
            'Sucre': ['Querobamba', 'Belén', 'Chalcos', 'Chilcayoc', 'Huacaña', 'Morcolla', 'Paico', 'San Pedro de Larcay', 'Santiago de Paucaray', 'Soras'],
            'Víctor Fajardo': ['Huancapi', 'Alcamenca', 'Apongo', 'Asquipata', 'Canaria', 'Cayara', 'Colca', 'Huamanquiquia', 'Huancaraylla', 'Huaya', 'Sarhua', 'Vilcanchos'],
            'Vilcas Huamán': ['Vilcas Huamán', 'Accomarca', 'Carhuanca', 'Concepción', 'Huambalpa', 'Independencia', 'Saurama', 'Vischongo'],
        }
    },
    'Apurímac': {
        provincias: ['Abancay', 'Andahuaylas', 'Antabamba', 'Aymaraes', 'Cotabambas', 'Chincheros', 'Grau'], distritos: {
            'Abancay': ['Abancay', 'Chacoche', 'Circa', 'Curahuasi', 'Huanipaca', 'Lambrama', 'Pichirhua', 'San Pedro de Cachora', 'Tamburco'],
            'Andahuaylas': ['Andahuaylas', 'Andarapa', 'Chiara', 'Huancarama', 'Huancaray', 'Huayana', 'Kaquiabamba', 'Kishuara', 'Pacobamba', 'Pacucha', 'Pampachiri', 'Pomacocha', 'San Antonio de Cachi', 'Santa María de Chicmo', 'Talavera', 'Turpo'],
            'Antabamba': ['Antabamba', 'El Oro', 'Huaquirca', 'Juan Espinoza Medrano', 'Oropesa', 'Pachaconas', 'Sabaino'],
            'Aymaraes': ['Chalhuanca', 'Calcauso', 'Capaya', 'Caraybamba', 'Chapimarca', 'Colcabamba', 'Cotaruse', 'Huayllo', 'Lucre', 'Pocohuanca', 'Sañayca', 'Soraya', 'Tapairihua', 'Tintay', 'Toraya', 'Yanaca'],
            'Cotabambas': ['Tambobamba', 'Challhuahuacho', 'Coyllurqui', 'Cotabambas', 'Haquira', 'Mara'],
            'Chincheros': ['Chincheros', 'Anco-Huallo', 'Cocharcas', 'Huaccana', 'Ocobamba', 'Ongoy', 'Ranracancha', 'Uranmarca'],
            'Grau': ['Chuquibambilla', 'Curasco', 'Gamarra', 'Huayllati', 'Mamara', 'Mariscal Gamarra', 'Micaela Bastidas', 'Palpacachi', 'Progreso', 'San Antonio', 'Santa Rosa', 'Turpay', 'Vilcabamba', 'Virundo'],
        }
    },
    'Puno': {
        provincias: ['Puno', 'Azángaro', 'Carabaya', 'Chucuito', 'El Collao', 'Huancané', 'Lampa', 'Melgar', 'Moho', 'San Antonio de Putina', 'San Román', 'Sandia', 'Yunguyo'], distritos: {
            'Puno': ['Puno', 'Acora', 'Amantaní', 'Atuncolla', 'Capachica', 'Chucuito', 'Coata', 'Huata', 'Mañazo', 'Paucarcolla', 'Pichacani', 'Platería', 'San Antonio', 'Tiquillaca', 'Vilque'],
            'Azángaro': ['Azángaro', 'Achaya', 'Arapa', 'Asillo', 'Caminaca', 'Chupa', 'José Domingo Choquehuanca', 'Muñani', 'Potoni', 'Saman', 'San Antón', 'San José', 'San Juan de Salinas', 'Santiago de Pupuja', 'Tirapata'],
            'Carabaya': ['Macusani', 'Ajoyani', 'Ayapata', 'Coasa', 'Corani', 'Crucero', 'Ituata', 'Ollachea', 'San Gabán', 'Usicayos'],
            'Chucuito': ['Juli', 'Desaguadero', 'Huacullani', 'Kelluyo', 'Pisacoma', 'Pomata', 'Zepita'],
            'El Collao': ['Ilave', 'Capazo', 'Conduriri', 'Pilcuyo', 'Santa Rosa'],
            'Huancané': ['Huancané', 'Cojata', 'Inchupalla', 'Pusi', 'Rosaspata', 'Taraco', 'Vilque Chico', 'Huatasani'],
            'Lampa': ['Lampa', 'Cabanilla', 'Calapuja', 'Nicasio', 'Ocuviri', 'Palca', 'Paratia', 'Pucará', 'Santa Lucía', 'Vilavila'],
            'Melgar': ['Ayaviri', 'Llalli', 'Macari', 'Nuñoa', 'Orurillo', 'Santa Rosa', 'Umachiri'],
            'Moho': ['Moho', 'Conima', 'Huayrapata', 'Tilali'],
            'San Antonio de Putina': ['Putina', 'Ananea', 'Pedro Vilca Apaza', 'Quilcapuncu', 'Sina'],
            'San Román': ['Juliaca', 'Cabana', 'Cabanillas', 'Caracoto'],
            'Sandia': ['Sandia', 'Alto Inambari', 'Cuyocuyo', 'Limbani', 'Patambuco', 'Phara', 'Quiaca', 'Yanahuaya'],
            'Yunguyo': ['Yunguyo', 'Anapia', 'Copani', 'Cuturapi', 'Ollaraya', 'Tinicachi', 'Unicachi'],
        }
    },
    'Junín': {
        provincias: ['Huancayo', 'Concepción', 'Chanchamayo', 'Junín', 'Satipo', 'Tarma', 'Yauli', 'Chupaca'], distritos: {
            'Huancayo': ['Huancayo', 'Carhuacallanga', 'Chacapampa', 'Chicche', 'Chilca', 'Chongos Alto', 'Chupuro', 'Colca', 'Cullhuas', 'El Tambo', 'Huacrapuquio', 'Hualhuas', 'Huancán', 'Huasicancha', 'Huayucachi', 'Ingenio', 'Pariahuanca', 'Pilcomayo', 'Pucará', 'Quichuay', 'Quilcas', 'San Agustín', 'San Jerónimo de Tunán', 'Saño', 'Sapallanga', 'Sicaya', 'Santo Domingo de Acobamba', 'Viques'],
            'Concepción': ['Concepción', 'Andamarca', 'Chambara', 'Cochas', 'Comas', 'Heroínas Toledo', 'Manzanares', 'Mariscal Castilla', 'Matahuasi', 'Mito', 'Nueve de Julio', 'Orcotuna', 'San José de Quero', 'Santa Rosa de Ocopa'],
            'Chanchamayo': ['Chanchamayo', 'Perené', 'Pichanaqui', 'San Luis de Shuaro', 'San Ramón', 'Vitoc'],
            'Junín': ['Junín', 'Carhuamayo', 'Ondores', 'Ulcumayo'],
            'Satipo': ['Satipo', 'Coviriali', 'Llaylla', 'Mazamari', 'Pampa Hermosa', 'Pangoa', 'Río Negro', 'Río Tambo', 'Vizcatán del Ene'],
            'Tarma': ['Tarma', 'Acobamba', 'Huaricolca', 'Huasahuasi', 'La Unión', 'Palca', 'Palcamayo', 'San Pedro de Cajas', 'Tapo'],
            'Yauli': ['La Oroya', 'Chacapalpa', 'Huay-Huay', 'Marcapomacocha', 'Morococha', 'Paccha', 'Santa Bárbara de Carhuacayán', 'Santa Rosa de Sacco', 'Suitucancha', 'Yauli'],
            'Chupaca': ['Chupaca', 'Ahuac', 'Chongos Bajo', 'Huachac', 'Huamancaca Chico', 'San Juan de Iscos', 'San Juan de Jarpa', 'Tres de Diciembre', 'Yanacancha'],
        }
    },
    'Amazonas': {
        provincias: ['Chachapoyas', 'Bagua', 'Bongará', 'Condorcanqui', 'Luya', 'Rodríguez de Mendoza', 'Utcubamba'], distritos: {
            'Chachapoyas': ['Chachapoyas', 'Asunción', 'Balsas', 'Cheto', 'Chiliquin', 'Chuquibamba', 'Granada', 'Huancas', 'La Jalca', 'Leimebamba', 'Levanto', 'Magdalena', 'Mariscal Castilla', 'Molinopampa', 'Montevideo', 'Olleros', 'Quinjalca', 'San Francisco de Daguas', 'San Isidro de Maino', 'Soloco', 'Sonche'],
            'Bagua': ['Aramango', 'Bagua', 'Copallín', 'El Parco', 'Imaza', 'La Peca'],
            'Bongará': ['Corosha', 'Cuispes', 'Florida', 'Jazán', 'Jumbilla', 'La Florida', 'Shipasbamba', 'Valera', 'Yambrasbamba'],
            'Condorcanqui': ['El Cenepa', 'Nieva', 'Río Santiago'],
            'Luya': ['Lamud', 'Camporredondo', 'Cocabamba', 'Colcamar', 'Conila', 'Inguilpata', 'Longuita', 'Lonya Chico', 'Luya', 'María', 'Ocalli', 'Ocumal', 'Pisuquía', 'Providencia', 'San Cristóbal', 'San Francisco de Yeso', 'San Jerónimo', 'San Juan de Lopecancha', 'Santa Catalina', 'Santo Tomás', 'Tingo', 'Trita'],
            'Rodríguez de Mendoza': ['Cochamal', 'Huambo', 'Limabamba', 'Longar', 'Mariscal Benavides', 'Milpuc', 'Omia', 'Santa Rosa', 'Totora', 'Vista Alegre'],
            'Utcubamba': ['Bagua Grande', 'Cajaruro', 'Cumba', 'El Milagro', 'Jamalca', 'Lonya Grande', 'Yamón'],
        }
    },
    'Áncash': {
        provincias: ['Huaraz', 'Aija', 'Antonio Raimondi', 'Asunción', 'Bolognesi', 'Carhuaz', 'Carlos Fermín Fitzcarrald', 'Casma', 'Corongo', 'Huari', 'Huarmey', 'Huaylas', 'Mariscal Luzuriaga', 'Ocros', 'Pallasca', 'Pomabamba', 'Recuay', 'Santa', 'Sihuas', 'Yungay'], distritos: {
            'Huaraz': ['Huaraz', 'Cochabamba', 'Colcabamba', 'Huanchay', 'Independencia', 'Jangas', 'La Libertad', 'Pampas', 'Paucas', 'Pira', 'Tanicá'],
            'Aija': ['Aija', 'Coris', 'Huacllán', 'La Merced', 'Succha'],
            'Antonio Raimondi': ['Aczo', 'Llamellín', 'Mirgas', 'San Juan de Rontoy'],
            'Asunción': ['Acochaca', 'Chacas'],
            'Bolognesi': ['Aquia', 'Cajacay', 'Canis', 'Chiquián', 'Colquioc', 'Huallanca', 'Huasta', 'Huayllacayán', 'La Primavera', 'Mancos', 'Mangas', 'Pacllón', 'San Juan de Rontoy', 'San Miguel de Corpanqui', 'Ticllos'],
            'Carhuaz': ['Carhuaz', 'Acopampa', 'Amashca', 'Anta', 'Ataquero', 'Marcará', 'Pariacoto', 'Paria', 'San Miguel de Aco', 'Shilla', 'Tinco', 'Yungar'],
            'Carlos Fermín Fitzcarrald': ['San Luis', 'San Nicolás', 'Yauya'],
            'Casma': ['Casma', 'Buenavista Alta', 'Comandante Noel', 'Yaután'],
            'Corongo': ['Corongo', 'Aco', 'Bambas', 'Cusca', 'La Pampa', 'Yanac', 'Yupán'],
            'Huari': ['Huari', 'Anra', 'Cajay', 'Chavín de Huántar', 'Huacachi', 'Huacchis', 'Huachis', 'Huantar', 'Masín', 'Paucas', 'Ponto', 'Rahuapampa', 'Rapayán', 'San Marcos', 'San Pedro de Chaná', 'Uco'],
            'Huarmey': ['Huarmey', 'Cochapetí', 'Culebras', 'Huayán', 'Malvas'],
            'Huaylas': ['Caraz', 'Huallanca', 'Huata', 'Huaylas', 'Mato', 'Pamparomas', 'Pueblo Libre', 'Santa Cruz', 'Santo Toribio', 'Yuracmarca'],
            'Mariscal Luzuriaga': ['Piscobamba', 'Eleazar Guzmán Barrón', 'Llama', 'Lucma', 'Musga'],
            'Ocros': ['Ocros', 'Acas', 'Cajamarquilla', 'Carhuapampa', 'Cochas', 'Congas', 'Llipa', 'San Cristóbal de Raján', 'San Pedro', 'Santiago de Chilcas'],
            'Pallasca': ['Cabana', 'Bolognesi', 'Conchucos', 'Huacaschuque', 'Huandoval', 'Lacabamba', 'Llapo', 'Pallasca', 'Pampas', 'Santa Rosa', 'Tauca'],
            'Pomabamba': ['Pomabamba', 'Huayllán', 'Parobamba', 'Quinuabamba'],
            'Recuay': ['Recuay', 'Catac', 'Cotaparaco', 'Huayllapampa', 'Llacllin', 'Marca', 'Pampas Chico', 'Pampas Grande', 'San Miguel de Pallaques', 'Sapac', 'Tapacocha', 'Ticapampa'],
            'Santa': ['Chimbote', 'Cáceres del Perú', 'Coishco', 'Macate', 'Moro', 'Nepeña', 'Samanco', 'Santa', 'Vinzos'],
            'Sihuas': ['Sihuas', 'Acobamba', 'Alfonso Ugarte', 'Cashapampa', 'Huayllabamba', 'Quiches', 'Ragash', 'San Juan', 'Sihuas'],
            'Yungay': ['Yungay', 'Cascapara', 'Manzatán', 'Matacoto', 'Quillo', 'Ranrahirca', 'Shupluy', 'Yanama'],
        }
    },
    'Cajamarca': {
        provincias: ['Cajamarca', 'Cajabamba', 'Celandín', 'Chota', 'Contumazá', 'Cutervo', 'Hualgayoc', 'Jaén', 'San Ignacio', 'San Marcos', 'San Miguel', 'San Pablo', 'Santa Cruz'], distritos: {
            'Cajamarca': ['Cajamarca', 'Asunción', 'Chetilla', 'Cospan', 'Encañada', 'Jesús', 'Llacanora', 'Los Baños del Inca', 'Magdalena', 'Matara', 'Namora', 'San Juan'],
            'Cajabamba': ['Cajabamba', 'Cachachi', 'Condebamba', 'Sitacocha'],
            'Celandín': ['Celandín', 'Chumuch', 'Curtovirco', 'Cortegana', 'Huacarbamba', 'Huachinga', 'Irac', 'Matahuasi', 'Miguel Iglesias', 'Miracosta', 'Oxamarca', 'Paccola', 'Querocotillo', 'Quindo', 'Sorochuco', 'Sucre', 'Utco', 'Yumbulag'],
            'Chota': ['Chota', 'Anguía', 'Chadín', 'Chiguirip', 'Chimban', 'Choropampa', 'Cochabamba', 'Conchan', 'Huambos', 'Lajas', 'Llama', 'Miracosta', 'Paccha', 'Pión', 'Querocoto', 'San Juan de Licupis', 'Tacabamba', 'Tocmoche'],
            'Contumazá': ['Contumazá', 'Chilete', 'Cupisnique', 'Guzmango', 'San Benito', 'Tantarica', 'Yonán'],
            'Cutervo': ['Cutervo', 'Callayuc', 'Choros', 'Cujillo', 'La Ramada', 'Pimpingos', 'Querocotillo', 'San Andrés de Cutervo', 'San Juan de Cutervo', 'San Luis de Lucma', 'Santa Cruz', 'Santo Domingo de la Capilla', 'Santo Tomás', 'Socota', 'Toribio Casanova'],
            'Hualgayoc': ['Bambamarca', 'Chugur', 'Hualgayoc'],
            'Jaén': ['Jaén', 'Bellavista', 'Chontali', 'Colasay', 'Huabal', 'Las Pirias', 'Pomahuaca', 'Pucará', 'Sallique', 'San Felipe', 'San José del Alto', 'Santa Rosa'],
            'San Ignacio': ['San Ignacio', 'Chirinos', 'Huarango', 'La Coipa', 'Namballe', 'San José de Lourdes', 'Tabaconas'],
            'San Marcos': ['Pedro Gálvez', 'Chancay', 'Eduardo Villanueva', 'Gregorio Pita', 'Ichocán', 'José Manuel Quiroz', 'José Sabogal', 'San Luis', 'San Nicolás', 'San Pedro de Pichu'],
            'San Miguel': ['San Miguel', 'Bolívar', 'Calquis', 'Catilluc', 'El Prado', 'La Florida', 'Llapa', 'Nanchoc', 'Niepos', 'San Gregorio', 'San Silvestre de Cochán', 'Tongod', 'Unión Agua Blanca'],
            'San Pablo': ['San Pablo', 'Kuntur Wasi', 'Niepos', 'San Bernardino', 'San Luis', 'Tumbaden'],
            'Santa Cruz': ['Santa Cruz', 'Andabamba', 'Catache', 'Chancaybaños', 'La Esperanza', 'Ninabamba', 'Pulan', 'Saucepampa', 'Sexi', 'Uticyacu', 'Yauyucán'],
        }
    },
    'Huancavelica': {
        provincias: ['Huancavelica', 'Acobamba', 'Angaraes', 'Castrovirreyna', 'Churcampa', 'Huaytará', 'Tayacaja'], distritos: {
            'Huancavelica': ['Huancavelica', 'Acobambilla', 'Acoria', 'Conayca', 'Cuenca', 'Huachocolpa', 'Huayllahuara', 'Izcuchaca', 'Laria', 'Manta', 'Mariscal Cáceres', 'Moya', 'Nuevo Occoro', 'Palca', 'Pilchaca', 'Vilca', 'Yauli'],
            'Acobamba': ['Acobamba', 'Andabamba', 'Anta', 'Caja', 'Marcas', 'Paucará', 'Pomacocha', 'Rosario'],
            'Angaraes': ['Lircay', 'Anchonga', 'Callanmarca', 'Ccochaccasa', 'Chincho', 'Congalla', 'Huanca-Huanca', 'Huayllay Grande', 'Julcamarca', 'San Antonio de Antaparco', 'Santo Tomás de Pata', 'Secclla'],
            'Castrovirreyna': ['Castrovirreyna', 'Arma', 'Aurahua', 'Capillas', 'Chupamarca', 'Cocas', 'Huachos', 'Huamatambo', 'Mollepampa', 'San Juan', 'Santa Ana', 'Ticrapo'],
            'Churcampa': ['Churcampa', 'Anco', 'Chinchihuasi', 'El Carmen', 'Huacchos', 'Huaribamba', 'Locroja', 'Paucarbamba', 'San Miguel de Mayocc', 'San Pedro de Coris'],
            'Huaytará': ['Huaytará', 'Ayavi', 'Córdova', 'Huayacundo Arma', 'Laramarca', 'Ocoyo', 'Pilpichaca', 'Querco', 'Quito-Arma', 'San Antonio de Cusicancha', 'San Francisco de Sangayaico', 'San Isidro', 'Santiago de Chocorvos', 'Santiago de Quirahuara', 'Santo Domingo de Capillas', 'Tambo'],
            'Tayacaja': ['Pampas', 'Acostambo', 'Acraquia', 'Ahuaycha', 'Colcabamba', 'Daniel Hernández', 'Huachocolpa', 'Pazos', 'Quishuar', 'Salcahuasi', 'San Marcos de Rocchac', 'Surcubamba', 'Tintay Puncu'],
        }
    },
    'Huánuco': {
        provincias: ['Huánuco', 'Ambo', 'Dos de Mayo', 'Huacaybamba', 'Huamalíes', 'Leoncio Prado', 'Marañón', 'Pachitea', 'Puerto Inca', 'Lauricocha', 'Yarowilca'], distritos: {
            'Huánuco': ['Huánuco', 'Amarilis', 'Chinchao', 'Churubamba', 'Margos', 'Pillco Marca', 'Quisqui', 'San Francisco de Cayrán', 'San Pedro de Chaulán', 'Santa María del Valle', 'Yarumayo'],
            'Ambo': ['Ambo', 'Cayna', 'Colpas', 'Conchamarca', 'Huácar', 'San Francisco', 'San Rafael', 'Tomay Kichwa'],
            'Dos de Mayo': ['La Unión', 'Baños', 'Chuquis', 'Marias', 'Pachas', 'Quivilla', 'Ripán', 'Shunqui', 'Sillapata', 'Yanas'],
            'Huacaybamba': ['Huacaybamba', 'Canchabamba', 'Cochabamba', 'Pinra'],
            'Huamalíes': ['Llata', 'Arancay', 'Chavín de Pariarca', 'Jacas Grande', 'Jircan', 'Miraflores', 'Monzón', 'Punchao', 'Puños', 'Singa', 'Tantamayo'],
            'Leoncio Prado': ['Rupa-Rupa', 'Daniel Alomía Robles', 'Hermílio Valdizán', 'José Crespo y Castillo', 'Luyando', 'Mariano Dámaso Beraún', 'Pucayacu'],
            'Marañón': ['Huacrachuco', 'Cholón', 'San Buenaventura'],
            'Pachitea': ['Panao', 'Chaglla', 'Molino', 'Umari'],
            'Puerto Inca': ['Puerto Inca', 'Codo del Pozuzo', 'Honoria', 'Irazola', 'Tournavista', 'Yuyapichis'],
            'Lauricocha': ['Jesús', 'Baños', 'Jivia', 'Queropalca', 'Rondos', 'San Francisco de Asís', 'San Miguel de Cauri'],
            'Yarowilca': ['Chavinillo', 'Aparicio Pomares', 'Cahuac', 'Choras', 'Jacas Chico', 'Obas', 'Pampamarca'],
        }
    },
    'Ica': {
        provincias: ['Ica', 'Chincha', 'Nasca', 'Palpa', 'Pisco'], distritos: {
            'Ica': ['Ica', 'La Tinguiña', 'Los Aquijes', 'Ocucaje', 'Pachacútec', 'Parcona', 'Pueblo Nuevo', 'Salas', 'San José de Los Molinos', 'San Juan Bautista', 'Santiago', 'Subtanjalla', 'Tate', 'Yauca del Rosario'],
            'Chincha': ['Chincha Alta', 'Alto Larán', 'Chavín', 'Chincha Baja', 'El Carmen', 'Grocio Prado', 'Pueblo Nuevo', 'San Juan de Yanac', 'San Pedro de Huacarpana', 'Sunampe', 'Tambo de Mora'],
            'Nasca': ['Nasca', 'Changuillo', 'El Ingenio', 'Marcona', 'Vista Alegre'],
            'Palpa': ['Palpa', 'Llipata', 'Río Grande', 'Santa Cruz', 'Tibillo'],
            'Pisco': ['Pisco', 'Huancano', 'Humay', 'Independencia', 'Paracas', 'San Andrés', 'San Clemente', 'Túpac Amaru Inca'],
        }
    },
    'La Libertad': {
        provincias: ['Trujillo', 'Ascope', 'Bolívar', 'Chepén', 'Julcán', 'Otuzco', 'Pacasmayo', 'Pataz', 'Sánchez Carrión', 'Santiago de Chuco', 'Gran Chimú', 'Virú'], distritos: {
            'Trujillo': ['Trujillo', 'El Porvenir', 'Florencia de Mora', 'Huanchaco', 'La Esperanza', 'Laredo', 'Moche', 'Poroto', 'Salaverry', 'Simbal', 'Víctor Larco Herrera'],
            'Ascope': ['Ascope', 'Chocope', 'Casa Grande', 'Chicama', 'Magdalena de Cao', 'Paiján', 'Rázuri', 'Santiago de Cao'],
            'Bolívar': ['Bolívar', 'Bambamarca', 'Condormarca', 'Longotea', 'Uchumarca', 'Ucuncha'],
            'Chepén': ['Chepén', 'Malabrigo', 'Pacanga'],
            'Julcán': ['Julcán', 'Calamarca', 'Carabamba', 'Huaso'],
            'Otuzco': ['Otuzco', 'Agallpampa', 'Charat', 'Huaranchal', 'La Cuesta', 'Mache', 'Paranday', 'Salpo', 'Sinsicap', 'Usquil'],
            'Pacasmayo': ['San Pedro de Lloc', 'Guadalupe', 'Jequetepeque', 'Pacasmayo', 'Tecapa'],
            'Pataz': ['Tayabamba', 'Buldibuyo', 'Chillia', 'Huancaspata', 'Huaylillas', 'Huayo', 'Ongon', 'Parcoy', 'Pataz', 'Pías', 'Santiago de Challas', 'Taurija', 'Urpay'],
            'Sánchez Carrión': ['Huamachuco', 'Chugay', 'Cochorco', 'Curgos', 'Marcabal', 'Sanagoran', 'Sarin', 'Sartimbamba'],
            'Santiago de Chuco': ['Santiago de Chuco', 'Angasmarca', 'Cachicadán', 'Mollebamba', 'Mollepata', 'Quiruvilca', 'Santa Cruz de Chuca', 'Sitabamba'],
            'Gran Chimú': ['Cascas', 'Lucma', 'Marmot', 'Sayapullo'],
            'Virú': ['Virú', 'Chao', 'Guadalupito'],
        }
    },
    'Lambayeque': {
        provincias: ['Chiclayo', 'Ferreñafe', 'Lambayeque'], distritos: {
            'Chiclayo': ['Chiclayo', 'Cayaltí', 'Chongoyape', 'Eten', 'Eten Puerto', 'José Leonardo Ortiz', 'La Victoria', 'Lagunas', 'Monsefú', 'Nueva Arica', 'Oyotún', 'Picsi', 'Pimentel', 'Pomalca', 'Pucalá', 'Reque', 'Santa Rosa', 'Saña', 'Tumán', 'Pátapo'],
            'Ferreñafe': ['Ferreñafe', 'Cañaris', 'Incahuasi', 'Manuel Antonio Mesones Muro', 'Pitipo', 'Pueblo Nuevo'],
            'Lambayeque': ['Lambayeque', 'Chóchope', 'Illimo', 'Jayanca', 'Mochumí', 'Mórrope', 'Motupe', 'Olmos', 'Pacora', 'Salas', 'San José', 'Tucume'],
        }
    },
    'Loreto': {
        provincias: ['Maynas', 'Alto Amazonas', 'Loreto', 'Mariscal Ramón Castilla', 'Requena', 'Ucayali', 'Datem del Marañón', 'Putumayo'], distritos: {
            'Maynas': ['Iquitos', 'Alto Nanay', 'Fernando Lores', 'Indiana', 'Las Amazonas', 'Mazan', 'Napo', 'Punchana', 'Belén', 'San Juan Bautista', 'Torres Causana', 'Yaquerana'],
            'Alto Amazonas': ['Yurimaguas', 'Balsapuerto', 'Cahuapanas', 'Jeberos', 'Lagunas', 'Santa Cruz', 'Teniente César López Rojas'],
            'Loreto': ['Nauta', 'Loreto', 'Parinari', 'Tigre', 'Trompeteros', 'Urarinas'],
            'Mariscal Ramón Castilla': ['Caballococha', 'Pebas', 'Ramón Castilla', 'San Pablo'],
            'Requena': ['Requena', 'Alto Tapiche', 'Capelo', 'Emilio San Martín', 'Jenaro Herrera', 'Maquia', 'Puinahua', 'Saquena', 'Soplin', 'Tapiche'],
            'Ucayali': ['Contamana', 'Inahuaya', 'Padre Márquez', 'Pampa Hermosa', 'Sarayacu', 'Vargas Guerra'],
            'Datem del Marañón': ['San Lorenzo', 'Andoas', 'Barranca', 'Cahuapanas', 'Manseriche', 'Morona', 'Pastaza'],
            'Putumayo': ['San Antonio del Estrecho', 'Putumayo', 'Rosa Panduro', 'Teniente Manuel Clavero', 'Yaguas'],
        }
    },
    'Madre de Dios': {
        provincias: ['Tambopata', 'Manu', 'Tahuamanu'], distritos: {
            'Tambopata': ['Tambopata', 'Inambari', 'Las Piedras', 'Laberinto'],
            'Manu': ['Manu', 'Fitzcarrald', 'Huepetuhe', 'Madre de Dios'],
            'Tahuamanu': ['Iñapari', 'Iberia', 'Tahuamanu'],
        }
    },
    'Moquegua': {
        provincias: ['Mariscal Nieto', 'General Sánchez Cerro', 'Ilo'], distritos: {
            'Mariscal Nieto': ['Moquegua', 'Carumas', 'Cuchumbaya', 'Samegua', 'San Cristóbal', 'Torata'],
            'General Sánchez Cerro': ['Omate', 'Coalaque', 'Chojata', 'Ichuña', 'La Capilla', 'Lloque', 'Matalaque', 'Puquina', 'Quinistaquillas', 'Ubinas', 'Yunga'],
            'Ilo': ['Ilo', 'El Algarrobal', 'Pacocha'],
        }
    },
    'Pasco': {
        provincias: ['Pasco', 'Daniel Alcides Carrión', 'Oxapampa'], distritos: {
            'Pasco': ['Chaupimarca', 'Huachón', 'Huariaca', 'Huayllay', 'Ninacaca', 'Pallanchacra', 'Paucartambo', 'San Francisco de Asís de Yarusyacán', 'Simón Bolívar', 'Ticlacayán', 'Tinyahuarco', 'Vicco', 'Yanacancha'],
            'Daniel Alcides Carrión': ['Yanahuanca', 'Chacayán', 'Goyllarisquizga', 'Paucar', 'San Pedro de Pillao', 'Santa Ana de Tusi', 'Tapuc', 'Vilcabamba'],
            'Oxapampa': ['Oxapampa', 'Chontabamba', 'Huancabamba', 'Palaz', 'Pozuzo', 'Puerto Bermúdez', 'Villa Rica', 'Constitución'],
        }
    },
    'Piura': {
        provincias: ['Piura', 'Ayabaca', 'Huancabamba', 'Morropón', 'Paita', 'Sechura', 'Sullana', 'Talara'], distritos: {
            'Piura': ['Piura', 'Castilla', 'Catacaos', 'Cura Mori', 'El Tallan', 'La Arena', 'La Unión', 'Las Lomas', 'Tambogrande', 'Veintiseis de Octubre'],
            'Ayabaca': ['Ayabaca', 'Frías', 'Jililí', 'Lagunas', 'Montero', 'Pacaipampa', 'Paimas', 'Sapillica', 'Sicchez', 'Suyo'],
            'Huancabamba': ['Huancabamba', 'Canchaque', 'El Carmen de la Frontera', 'Huarmaca', 'Lalaquiz', 'San Miguel del Faique', 'Sondor', 'Sondorillo'],
            'Morropón': ['Chulucanas', 'Buenos Aires', 'Chalaco', 'La Matanza', 'Morropón', 'Salitral', 'San Juan de Bigote', 'Santa Catalina de Mossa', 'Santo Domingo', 'Yamango'],
            'Paita': ['Paita', 'Amotape', 'Arenal', 'Colan', 'La Huaca', 'Lobitos', 'Los Órganos', 'Mancora', 'Tamarindo', 'Vichayal'],
            'Sechura': ['Sechura', 'Bellavista de La Unión', 'Bernal', 'Cristo Nos Valga', 'Rinconada Llicuar', 'Vice'],
            'Sullana': ['Sullana', 'Bellavista', 'Ignacio Escudero', 'Lancones', 'Marcavelica', 'Miguel Checa', 'Querecotillo', 'Salatí', 'San Juan de Bigote'],
            'Talara': ['Talara', 'El Alto', 'La Brea', 'Lobitos', 'Los Órganos', 'Máncora', 'Pariñas'],
        }
    },
    'San Martín': {
        provincias: ['Moyobamba', 'Bellavista', 'El Dorado', 'Huallaga', 'Lamas', 'Mariscal Cáceres', 'Picota', 'Rioja', 'San Martín', 'Tocache'], distritos: {
            'Moyobamba': ['Moyobamba', 'Calzada', 'Habana', 'Jepelacio', 'Soritor', 'Yantalo'],
            'Bellavista': ['Bellavista', 'Alto Biavo', 'Bajo Biavo', 'Huallaga', 'San Pablo', 'San Rafael'],
            'El Dorado': ['San José de Sisa', 'Agua Blanca', 'San Martín', 'Santa Rosa', 'Shatoja'],
            'Huallaga': ['Saposoa', 'Alto Saposoa', 'El Eslabón', 'Piscoyacu', 'Sacanche', 'Tingo de Saposoa'],
            'Lamas': ['Lamas', 'Alonso de Alvarado', 'Barranquita', 'Cacatachi', 'Chazuta', 'Chipurana', 'Cuñumbuqui', 'Pinto Recodo', 'Rumisapa', 'San Roque de Cumbaza', 'Shanao', 'Tabalosos', 'Zapatero'],
            'Mariscal Cáceres': ['Juanjuí', 'Campanilla', 'Huicungo', 'Pachiza', 'Pajarillo'],
            'Picota': ['Picota', 'Buenos Aires', 'Caspisapa', 'Pilluana', 'Pucacaca', 'San Cristóbal', 'San Hilarión', 'Tingo de Ponasa', 'Tres Unidos'],
            'Rioja': ['Rioja', 'Awajún', 'Elias Soplin Vargas', 'Nueva Cajamarca', 'Pardo Miguel', 'Polvora', 'San Fernando', 'Yorongos'],
            'San Martín': ['Tarapoto', 'Alberto Leveau', 'Cacatachi', 'Chazuta', 'Chipurana', 'El Porvenir', 'Huimbayoc', 'Juan Guerra', 'La Banda de Shilcayo', 'Morales', 'Papaplaya', 'San Antonio', 'Sauce', 'Shapaja'],
            'Tocache': ['Tocache', 'Nuevo Progreso', 'Pólvora', 'Shunte', 'Uchiza'],
        }
    },
    'Tacna': {
        provincias: ['Tacna', 'Candarave', 'Jorge Basadre', 'Tarata'], distritos: {
            'Tacna': ['Tacna', 'Alto de la Alianza', 'Calana', 'Ciudad Nueva', 'Inclán', 'Pachia', 'Palca', 'Pocollay', 'Sama', 'Coronel Gregorio Albarracín Lanchipa'],
            'Candarave': ['Candarave', 'Cairani', 'Camilaca', 'Curibaya', 'Huanuara', 'Quilahuani'],
            'Jorge Basadre': ['Locumba', 'Ite', 'Ilabaya'],
            'Tarata': ['Tarata', 'Estique', 'Estique Pampa', 'Sitajara', 'Susapaya', 'Tarucachi'],
        }
    },
    'Tumbes': {
        provincias: ['Tumbes', 'Contralmirante Villar', 'Zarumilla'], distritos: {
            'Tumbes': ['Tumbes', 'Corrales', 'La Cruz', 'Pampas de Hospital', 'San Jacinto', 'San Juan de la Virgen'],
            'Contralmirante Villar': ['Zorritos', 'Casitas'],
            'Zarumilla': ['Zarumilla', 'Aguas Verdes', 'Matapalo', 'Papayal'],
        }
    },
    'Ucayali': {
        provincias: ['Coronel Portillo', 'Atalaya', 'Padre Abad', 'Purús'], distritos: {
            'Coronel Portillo': ['Callería', 'Campoverde', 'Iparia', 'Masisea', 'Yarinacocha', 'Nueva Requena', 'Manantay'],
            'Atalaya': ['Raymondi', 'Sepahua', 'Tahuanía', 'Yurúa'],
            'Padre Abad': ['Aguaytía', 'Irazola', 'Von Humboldt', 'Curimaná'],
            'Purús': ['Purús'],
        }
    },
    'Callao': {
        provincias: ["Callao"],
        distritos: {
            Callao: [
                "Bellavista",
                "Callao",
                "Carmen de la Legua Reynoso",
                "La Perla",
                "La Punta",
                "Mi Perú",
                "Ventanilla",
            ],
        },
    },
};

const SERVICE_OPTIONS = [
    "Convenio de Prácticas",
    "Seguimiento de Practicante",
    "Reporte / Evaluación",
    "Soporte de Plataforma",
    "Facturación / Pagos",
    "Certificados / Constancias",
    "Atención al Usuario",
    "Otro (especificar)",
];

const DEPARTAMENTOS = Object.keys(PERU_DATA).sort();

const STATUS_CLASS_MAP: Record<string, string> = {
    Pendiente: "status-pendiente",
    "En Proceso": "status-proceso",
    Respondido: "status-respondido",
    Cerrado: "status-cerrado",
};

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------
interface ReclamoForm {
    doc_type: string;
    dni: string;
    apellido_paterno: string;
    apellido_materno: string;
    nombres: string;
    telefono: string;
    email: string;
    department: string;
    province: string;
    district: string;
    domicilio: string;
    is_minor: boolean;
    parent_doc_type: string;
    parent_dni: string;
    parent_apellido_paterno: string;
    parent_apellido_materno: string;
    parent_nombres: string;
    parent_telefono: string;
    parent_email: string;
    parent_department: string;
    parent_province: string;
    parent_district: string;
    parent_domicilio: string;
    amount: string;
    service_description: string;
    claim_description: string;
    claim_request: string;
    claim_type: string;
    declaration: boolean;
}

const EMPTY_FORM: ReclamoForm = {
    doc_type: "",
    dni: "",
    apellido_paterno: "",
    apellido_materno: "",
    nombres: "",
    telefono: "",
    email: "",
    department: "",
    province: "",
    district: "",
    domicilio: "",
    is_minor: false,
    parent_doc_type: "",
    parent_dni: "",
    parent_apellido_paterno: "",
    parent_apellido_materno: "",
    parent_nombres: "",
    parent_telefono: "",
    parent_email: "",
    parent_department: "",
    parent_province: "",
    parent_district: "",
    parent_domicilio: "",
    amount: "",
    service_description: "",
    claim_description: "",
    claim_request: "",
    claim_type: "",
    declaration: false,
};

export default function Reclamaciones() {
    const [activeTab, setActiveTab] = useState<"form" | "seguimiento">("form");

    // ---- estado de envío ----
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [trackingCodeResult, setTrackingCodeResult] = useState("");
    const [claimNumber, setClaimNumber] = useState("");
    const [submitError, setSubmitError] = useState("");

    // ---- estado de búsqueda / seguimiento ----
    const [isSearching, setIsSearching] = useState(false);
    const [searchCode, setSearchCode] = useState("");
    const [searchDni, setSearchDni] = useState("");
    const [searchResult, setSearchResult] = useState<any>(null);
    const [searchError, setSearchError] = useState("");

    // ---- ubigeo ----
    const [provincias, setProvincias] = useState<string[]>([]);
    const [distritos, setDistritos] = useState<string[]>([]);
    const [parentProvincias, setParentProvincias] = useState<string[]>([]);
    const [parentDistritos, setParentDistritos] = useState<string[]>([]);

    // ---- servicios ----
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [otroServicio, setOtroServicio] = useState("");
    const [showOtroServicio, setShowOtroServicio] = useState(false);

    // ---- formulario ----
    const [form, setForm] = useState<ReclamoForm>(EMPTY_FORM);

    // ---- captcha / fecha ----
    const [captchaCode, setCaptchaCode] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const [currentDate, setCurrentDate] = useState("");

    const generateCaptcha = useCallback(() => {
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        setCaptchaCode(code);
        setCaptchaInput("");
    }, []);

    useEffect(() => {
        generateCaptcha();
        setCurrentDate(
            new Date().toLocaleDateString("es-PE", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
            })
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // -------------------------------------------------------------------------
    // Helpers de formulario
    // -------------------------------------------------------------------------
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target as HTMLInputElement;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const onDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const dept = e.target.value;
        setForm((prev) => ({ ...prev, department: dept, province: "", district: "" }));
        setDistritos([]);
        setProvincias(PERU_DATA[dept]?.provincias ?? []);
    };

    const onProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const province = e.target.value;
        setForm((prev) => ({ ...prev, province, district: "" }));
        setDistritos(PERU_DATA[form.department]?.distritos[province] ?? []);
    };

    const onParentDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const dept = e.target.value;
        setForm((prev) => ({
            ...prev,
            parent_department: dept,
            parent_province: "",
            parent_district: "",
        }));
        setParentDistritos([]);
        setParentProvincias(PERU_DATA[dept]?.provincias ?? []);
    };

    const onParentProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const province = e.target.value;
        setForm((prev) => ({ ...prev, parent_province: province, parent_district: "" }));
        setParentDistritos(PERU_DATA[form.parent_department]?.distritos[province] ?? []);
    };

    const toggleService = (service: string) => {
        setSelectedServices((prev) => {
            const exists = prev.includes(service);
            const next = exists ? prev.filter((s) => s !== service) : [...prev, service];
            const showOtro = next.includes("Otro (especificar)");
            setShowOtroServicio(showOtro);
            if (!showOtro) setOtroServicio("");
            return next;
        });
    };

    const isServiceSelected = (service: string) => selectedServices.includes(service);

    // -------------------------------------------------------------------------
    // Envío
    // -------------------------------------------------------------------------
    const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;
        setSubmitError("");

        if (captchaInput !== captchaCode) {
            setSubmitError("Código de verificación incorrecto.");
            generateCaptcha();
            return;
        }
        if (selectedServices.length === 0) {
            setSubmitError("Debes seleccionar al menos un tipo de servicio.");
            return;
        }
        if (!form.claim_type) {
            setSubmitError("Debes seleccionar el tipo de reclamación.");
            return;
        }
        if (!form.declaration) {
            setSubmitError("Debes aceptar la declaración jurada.");
            return;
        }
        if (!form.department) {
            setSubmitError("Selecciona el Departamento.");
            return;
        }
        if (!form.province) {
            setSubmitError("Selecciona la Provincia.");
            return;
        }
        if (!form.district) {
            setSubmitError("Selecciona el Distrito.");
            return;
        }
        if (form.is_minor) {
            if (!form.parent_department) {
                setSubmitError("Selecciona el Departamento del representante.");
                return;
            }
            if (!form.parent_province) {
                setSubmitError("Selecciona la Provincia del representante.");
                return;
            }
            if (!form.parent_district) {
                setSubmitError("Selecciona el Distrito del representante.");
                return;
            }
        }

        const services =
            showOtroServicio && otroServicio
                ? [...selectedServices.filter((s) => s !== "Otro (especificar)"), otroServicio]
                : selectedServices.filter((s) => s !== "Otro (especificar)");

        const payload = {
            ...form,
            is_minor: form.is_minor,
            service_type: services,
            amount: form.amount || null,
        };

        setIsSubmitting(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(apiUrl("/reclamaciones"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify(payload),
                signal: controller.signal,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al enviar. Intente nuevamente.");
            }

            setTrackingCodeResult(data.tracking_code);
            setClaimNumber(String(data.id).padStart(8, "0"));
            setShowSuccess(true);
        } catch (error: any) {
            setSubmitError(
                error.name === "AbortError"
                    ? "El servidor tardó demasiado. Intente nuevamente."
                    : error.message || "Error al enviar. Intente nuevamente."
            );
            generateCaptcha();
        } finally {
            clearTimeout(timeoutId);
            setIsSubmitting(false);
        }
    };

    const nuevoReclamo = () => {
        setShowSuccess(false);
        setTrackingCodeResult("");
        setClaimNumber("");
        setSelectedServices([]);
        setOtroServicio("");
        setShowOtroServicio(false);
        setForm(EMPTY_FORM);
        setProvincias([]);
        setDistritos([]);
        setParentProvincias([]);
        setParentDistritos([]);
        setSubmitError("");
        generateCaptcha();
    };

    // -------------------------------------------------------------------------
    // Búsqueda / seguimiento
    // -------------------------------------------------------------------------
    const buscarReclamo = async () => {
        if (isSearching) return;
        if (!searchCode.trim() && !searchDni.trim()) {
            setSearchError("Ingresa un código de seguimiento o DNI para buscar.");
            return;
        }
        setIsSearching(true);
        setSearchError("");
        setSearchResult(null);

        const params = new URLSearchParams();
        if (searchCode.trim()) params.set("tracking_code", searchCode.trim());
        if (searchDni.trim()) params.set("dni", searchDni.trim());

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        try {
            const response = await fetch(apiUrl(`/reclamaciones/buscar?${params.toString()}`), {
                method: "GET",
                headers: { Accept: "application/json" },
                signal: controller.signal,
            });

            const data = await response.json();

            if (!response.ok) {
                setSearchError(data.error || "No se encontró ningún reclamo con los datos ingresados.");
                return;
            }

            setSearchResult(data);
        } catch (error: any) {
            setSearchError(
                error.name === "AbortError"
                    ? "El servidor tardó demasiado. Intente nuevamente."
                    : "Error al buscar. Intente nuevamente."
            );
        } finally {
            clearTimeout(timeoutId);
            setIsSearching(false);
        }
    };

    const getStatusClass = (status: string) =>
        STATUS_CLASS_MAP[status] || "status-pendiente";

    const formatId = (id: number) => String(id).padStart(8, "0");

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("es-PE", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------
    return (
        <>
            {/* Hero */}
            <section className="hero-component">
                <div className="hero-content">
                    <h1>Libro de Reclamaciones Virtual</h1>
                    <p>Matt Innova Solution — Gestión de Practicantes</p>
                </div>
            </section>

            {/* Main */}
            <section className="rec-main">
                <div className="rec-container">
                    {/* Tabs */}
                    <div className="rec-tabs">
                        <button
                            type="button"
                            className={`rec-tab ${activeTab === "form" ? "active" : ""}`}
                            onClick={() => setActiveTab("form")}
                        >
                            <i className="fas fa-file-alt"></i> Formulario de Reclamación
                        </button>
                        <button
                            type="button"
                            className={`rec-tab ${activeTab === "seguimiento" ? "active" : ""}`}
                            onClick={() => setActiveTab("seguimiento")}
                        >
                            <i className="fas fa-search"></i> Seguimiento
                        </button>
                    </div>

                    {/* TAB: FORMULARIO */}
                    {activeTab === "form" && (
                        <div className="rec-card">
                            {!showSuccess ? (
                                <>
                                    <div className="rec-card-header">
                                        <i className="fas fa-book"></i>
                                        <h2>Registro de Reclamo / Queja</h2>
                                        <p>Libro de Reclamaciones — Matt Innova Solution</p>
                                    </div>

                                    {submitError && (
                                        <div className="rec-error">
                                            <i className="fas fa-exclamation-circle"></i> {submitError}
                                        </div>
                                    )}

                                    <form onSubmit={enviar}>
                                        {/* SECCIÓN 1: RECLAMANTE */}
                                        <div className="rec-section">
                                            <div className="rec-section-header">
                                                1. IDENTIFICACIÓN DEL USUARIO RECLAMANTE
                                            </div>

                                            <div className="rec-row two">
                                                <div className="rec-group">
                                                    <label>
                                                        Tipo de Documento <span className="req">*</span>
                                                    </label>
                                                    <select
                                                        name="doc_type"
                                                        value={form.doc_type}
                                                        onChange={handleChange}
                                                        required
                                                    >
                                                        <option value="">Selecciona...</option>
                                                        <option value="DNI">DNI</option>
                                                        <option value="CE">Carné de Extranjería</option>
                                                        <option value="Pasaporte">Pasaporte</option>
                                                    </select>
                                                </div>
                                                <div className="rec-group">
                                                    <label>
                                                        Número de Documento <span className="req">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="dni"
                                                        value={form.dni}
                                                        onChange={handleChange}
                                                        placeholder="Mínimo 8 caracteres"
                                                        required
                                                        minLength={8}
                                                    />
                                                </div>
                                            </div>

                                            <div className="rec-row two">
                                                <div className="rec-group">
                                                    <label>
                                                        Apellido Paterno <span className="req">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="apellido_paterno"
                                                        value={form.apellido_paterno}
                                                        onChange={handleChange}
                                                        placeholder="Máximo 50 caracteres"
                                                        required
                                                        maxLength={50}
                                                    />
                                                </div>
                                                <div className="rec-group">
                                                    <label>
                                                        Apellido Materno <span className="req">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="apellido_materno"
                                                        value={form.apellido_materno}
                                                        onChange={handleChange}
                                                        placeholder="Máximo 50 caracteres"
                                                        required
                                                        maxLength={50}
                                                    />
                                                </div>
                                            </div>

                                            <div className="rec-row two">
                                                <div className="rec-group">
                                                    <label>
                                                        Nombres <span className="req">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="nombres"
                                                        value={form.nombres}
                                                        onChange={handleChange}
                                                        placeholder="Máximo 50 caracteres"
                                                        required
                                                        maxLength={50}
                                                    />
                                                </div>
                                                <div className="rec-group">
                                                    <label>
                                                        Teléfono <span className="req">*</span>
                                                    </label>
                                                    <input
                                                        type="tel"
                                                        name="telefono"
                                                        value={form.telefono}
                                                        onChange={handleChange}
                                                        placeholder="9 dígitos"
                                                        required
                                                        maxLength={15}
                                                    />
                                                </div>
                                            </div>

                                            <div className="rec-row one">
                                                <div className="rec-group">
                                                    <label>
                                                        Correo Electrónico <span className="req">*</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={form.email}
                                                        onChange={handleChange}
                                                        placeholder="ejemplo@correo.com"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="rec-row three">
                                                <div className="rec-group">
                                                    <label>
                                                        Departamento <span className="req">*</span>
                                                    </label>
                                                    <select
                                                        name="department"
                                                        value={form.department}
                                                        onChange={onDepartmentChange}
                                                        required
                                                    >
                                                        <option value="">Selecciona...</option>
                                                        {DEPARTAMENTOS.map((dep) => (
                                                            <option key={dep} value={dep}>
                                                                {dep}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="rec-group">
                                                    <label>
                                                        Provincia <span className="req">*</span>
                                                    </label>
                                                    <select
                                                        name="province"
                                                        value={form.province}
                                                        onChange={onProvinceChange}
                                                        disabled={!provincias.length}
                                                    >
                                                        <option value="">Selecciona...</option>
                                                        {provincias.map((p) => (
                                                            <option key={p} value={p}>
                                                                {p}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="rec-group">
                                                    <label>
                                                        Distrito <span className="req">*</span>
                                                    </label>
                                                    <select
                                                        name="district"
                                                        value={form.district}
                                                        onChange={handleChange}
                                                        disabled={!distritos.length}
                                                    >
                                                        <option value="">Selecciona...</option>
                                                        {distritos.map((d) => (
                                                            <option key={d} value={d}>
                                                                {d}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="rec-row one">
                                                <div className="rec-group">
                                                    <label>
                                                        Domicilio <span className="req">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="domicilio"
                                                        value={form.domicilio}
                                                        onChange={handleChange}
                                                        placeholder="Máximo 200 caracteres"
                                                        required
                                                        maxLength={200}
                                                    />
                                                </div>
                                            </div>

                                            <div className="rec-row one">
                                                <div className="rec-group">
                                                    <label>¿Es menor de edad?</label>
                                                    <div className="rec-radios">
                                                        <label className="rec-radio-item">
                                                            <input
                                                                type="radio"
                                                                name="is_minor"
                                                                checked={form.is_minor === true}
                                                                onChange={() =>
                                                                    setForm((prev) => ({ ...prev, is_minor: true }))
                                                                }
                                                            />{" "}
                                                            Sí
                                                        </label>
                                                        <label className="rec-radio-item">
                                                            <input
                                                                type="radio"
                                                                name="is_minor"
                                                                checked={form.is_minor === false}
                                                                onChange={() =>
                                                                    setForm((prev) => ({ ...prev, is_minor: false }))
                                                                }
                                                            />{" "}
                                                            No
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            {form.is_minor && (
                                                <div className="rec-minor-box">
                                                    <h4>
                                                        <i className="fas fa-user-shield"></i> Datos del Representante
                                                        (Menor de Edad)
                                                    </h4>

                                                    <div className="rec-row two">
                                                        <div className="rec-group">
                                                            <label>
                                                                Tipo de Documento <span className="req">*</span>
                                                            </label>
                                                            <select
                                                                name="parent_doc_type"
                                                                value={form.parent_doc_type}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Selecciona...</option>
                                                                <option value="DNI">DNI</option>
                                                                <option value="CE">Carné de Extranjería</option>
                                                                <option value="Pasaporte">Pasaporte</option>
                                                            </select>
                                                        </div>
                                                        <div className="rec-group">
                                                            <label>
                                                                Número de Documento <span className="req">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="parent_dni"
                                                                value={form.parent_dni}
                                                                onChange={handleChange}
                                                                placeholder="Mínimo 8 caracteres"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="rec-row two">
                                                        <div className="rec-group">
                                                            <label>
                                                                Apellido Paterno <span className="req">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="parent_apellido_paterno"
                                                                value={form.parent_apellido_paterno}
                                                                onChange={handleChange}
                                                                placeholder="Máximo 50 caracteres"
                                                            />
                                                        </div>
                                                        <div className="rec-group">
                                                            <label>
                                                                Apellido Materno <span className="req">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="parent_apellido_materno"
                                                                value={form.parent_apellido_materno}
                                                                onChange={handleChange}
                                                                placeholder="Máximo 50 caracteres"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="rec-row two">
                                                        <div className="rec-group">
                                                            <label>
                                                                Nombres <span className="req">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="parent_nombres"
                                                                value={form.parent_nombres}
                                                                onChange={handleChange}
                                                                placeholder="Máximo 50 caracteres"
                                                            />
                                                        </div>
                                                        <div className="rec-group">
                                                            <label>
                                                                Teléfono <span className="req">*</span>
                                                            </label>
                                                            <input
                                                                type="tel"
                                                                name="parent_telefono"
                                                                value={form.parent_telefono}
                                                                onChange={handleChange}
                                                                placeholder="9 dígitos"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="rec-row one">
                                                        <div className="rec-group">
                                                            <label>
                                                                Email <span className="req">*</span>
                                                            </label>
                                                            <input
                                                                type="email"
                                                                name="parent_email"
                                                                value={form.parent_email}
                                                                onChange={handleChange}
                                                                placeholder="ejemplo@correo.com"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="rec-row three">
                                                        <div className="rec-group">
                                                            <label>
                                                                Departamento <span className="req">*</span>
                                                            </label>
                                                            <select
                                                                name="parent_department"
                                                                value={form.parent_department}
                                                                onChange={onParentDepartmentChange}
                                                            >
                                                                <option value="">Selecciona...</option>
                                                                {DEPARTAMENTOS.map((dep) => (
                                                                    <option key={dep} value={dep}>
                                                                        {dep}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="rec-group">
                                                            <label>
                                                                Provincia <span className="req">*</span>
                                                            </label>
                                                            <select
                                                                name="parent_province"
                                                                value={form.parent_province}
                                                                onChange={onParentProvinceChange}
                                                                disabled={!parentProvincias.length}
                                                            >
                                                                <option value="">Selecciona...</option>
                                                                {parentProvincias.map((p) => (
                                                                    <option key={p} value={p}>
                                                                        {p}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="rec-group">
                                                            <label>
                                                                Distrito <span className="req">*</span>
                                                            </label>
                                                            <select
                                                                name="parent_district"
                                                                value={form.parent_district}
                                                                onChange={handleChange}
                                                                disabled={!parentDistritos.length}
                                                            >
                                                                <option value="">Selecciona...</option>
                                                                {parentDistritos.map((d) => (
                                                                    <option key={d} value={d}>
                                                                        {d}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div className="rec-row one">
                                                        <div className="rec-group">
                                                            <label>
                                                                Domicilio <span className="req">*</span>
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="parent_domicilio"
                                                                value={form.parent_domicilio}
                                                                onChange={handleChange}
                                                                placeholder="Máximo 200 caracteres"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* SECCIÓN 2: SERVICIO */}
                                        <div className="rec-section">
                                            <div className="rec-section-header">
                                                2. IDENTIFICACIÓN DEL SERVICIO RELACIONADO
                                            </div>

                                            <div className="rec-group">
                                                <label>
                                                    Tipo de Servicio <span className="req">*</span>
                                                </label>

                                                <div className="rec-checkboxes">
                                                    {SERVICE_OPTIONS.map((srv) => (
                                                        <label className="rec-check-item" key={srv}>
                                                            <input
                                                                type="checkbox"
                                                                checked={isServiceSelected(srv)}
                                                                onChange={() => toggleService(srv)}
                                                            />
                                                            {srv}
                                                        </label>
                                                    ))}
                                                </div>
                                                {showOtroServicio && (
                                                    <input
                                                        type="text"
                                                        value={otroServicio}
                                                        onChange={(e) => setOtroServicio(e.target.value)}
                                                        placeholder="Especifica el servicio reclamado"
                                                        className="rec-otro-input"
                                                    />
                                                )}
                                            </div>

                                            <div className="rec-row two">
                                                <div className="rec-group">
                                                    <br />
                                                    <label>Monto Relacionado (Opcional)</label>
                                                    <div className="rec-amount">
                                                        <span>S/.</span>
                                                        <input
                                                            type="number"
                                                            name="amount"
                                                            value={form.amount}
                                                            onChange={handleChange}
                                                            placeholder="0.00"
                                                            min={0}
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rec-row one">
                                                <div className="rec-group">
                                                    <label>
                                                        Descripción del Servicio <span className="req">*</span>
                                                    </label>
                                                    <textarea
                                                        name="service_description"
                                                        value={form.service_description}
                                                        onChange={handleChange}
                                                        placeholder="Ej: Convenio de prácticas del ciclo 2026-I"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECCIÓN 3: DETALLE */}
                                        <div className="rec-section">
                                            <div className="rec-section-header">
                                                3. DETALLE DE LA RECLAMACIÓN Y PEDIDO
                                            </div>

                                            <div className="rec-row one">
                                                <div className="rec-group">
                                                    <label>
                                                        Descripción Detallada del Reclamo / Queja{" "}
                                                        <span className="req">*</span>
                                                    </label>
                                                    <textarea
                                                        name="claim_description"
                                                        value={form.claim_description}
                                                        onChange={handleChange}
                                                        placeholder="Describe detalladamente qué sucedió, cuándo ocurrió y por qué estás disconforme..."
                                                        required
                                                        minLength={50}
                                                    />
                                                    <small>
                                                        Mínimo 50 caracteres. Sé específico para una mejor respuesta.
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="rec-row one">
                                                <div className="rec-group">
                                                    <label>
                                                        ¿Qué esperas que se resuelva? <span className="req">*</span>
                                                    </label>
                                                    <textarea
                                                        name="claim_request"
                                                        value={form.claim_request}
                                                        onChange={handleChange}
                                                        placeholder="Ej: Corrección del registro, soporte técnico, etc."
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="rec-row one">
                                                <div className="rec-group">
                                                    <label>
                                                        Tipo de Reclamación <span className="req">*</span>
                                                    </label>
                                                    <div className="rec-radios vertical">
                                                        <label className="rec-radio-item">
                                                            <input
                                                                type="radio"
                                                                name="claim_type"
                                                                value="Reclamo"
                                                                checked={form.claim_type === "Reclamo"}
                                                                onChange={handleChange}
                                                            />
                                                            <span>
                                                                <strong>RECLAMO:</strong> Disconformidad relacionada al
                                                                servicio brindado en la plataforma.
                                                            </span>
                                                        </label>
                                                        <label className="rec-radio-item">
                                                            <input
                                                                type="radio"
                                                                name="claim_type"
                                                                value="Queja"
                                                                checked={form.claim_type === "Queja"}
                                                                onChange={handleChange}
                                                            />
                                                            <span>
                                                                <strong>QUEJA:</strong> Disconformidad no relacionada al
                                                                servicio, o malestar respecto a la atención recibida.
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* SECCIÓN 4: DECLARACIÓN */}
                                        <div className="rec-section">
                                            <div className="rec-section-header">4. DECLARACIÓN Y CONFORMIDAD</div>

                                            <label className="rec-check-item declaration">
                                                <input
                                                    type="checkbox"
                                                    name="declaration"
                                                    checked={form.declaration}
                                                    onChange={handleChange}
                                                />
                                                <span>
                                                    Declaro bajo juramento que la información proporcionada es veraz
                                                    y completa.
                                                </span>
                                            </label>

                                            <div className="rec-legal">
                                                <p>
                                                    En cumplimiento de la Ley N° 29733 — Ley de Protección de Datos
                                                    Personales, la información será utilizada exclusivamente para la
                                                    gestión de reclamos por Matt Innova Solution.
                                                </p>
                                            </div>

                                            <div className="rec-date-display">
                                                <strong>Fecha y Hora del Sistema:</strong> {currentDate}
                                            </div>
                                        </div>

                                        {/* CAPTCHA */}
                                        <div className="rec-captcha-row">
                                            <div className="rec-group">
                                                <label>
                                                    Código de Verificación <span className="req">*</span>
                                                </label>
                                                <div className="rec-captcha">
                                                    <span className="captcha-code">{captchaCode}</span>
                                                    <button
                                                        type="button"
                                                        className="btn-refresh"
                                                        onClick={generateCaptcha}
                                                        title="Generar nuevo código"
                                                    >
                                                        <i className="fas fa-sync-alt"></i>
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={captchaInput}
                                                    onChange={(e) => setCaptchaInput(e.target.value)}
                                                    placeholder="Ingresa el código"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        {/* BOTONES */}
                                        <div className="rec-actions">
                                            <button type="button" className="btn-cancelar" onClick={nuevoReclamo}>
                                                <i className="fas fa-times"></i> Cancelar
                                            </button>
                                            <button type="submit" className="btn-enviar" disabled={isSubmitting}>
                                                {!isSubmitting ? (
                                                    <>
                                                        <i className="fas fa-paper-plane"></i> Enviar Reclamo
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-spinner fa-spin"></i> Enviando...
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="rec-plazo">
                                            <i className="fas fa-clock"></i>
                                            Matt Innova Solution dará respuesta en un plazo no mayor a{" "}
                                            <strong>15 días hábiles</strong>.
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="rec-success">
                                    <div className="rec-success-icon">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <h2>¡Reclamo Registrado Exitosamente!</h2>
                                    <p>Su solicitud fue registrada en el Libro de Reclamaciones Virtual.</p>
                                    <p>
                                        Si no observa el correo de confirmación en su bandeja de entrada, revise
                                        el correo no deseado.
                                    </p>
                                    <div className="rec-tracking-box">
                                        <span className="rec-tracking-label">Número de Reclamo</span>
                                        <strong>Nº {claimNumber}</strong>
                                    </div>

                                    <div className="rec-tracking-box">
                                        <span className="rec-tracking-label">Código de Seguimiento</span>
                                        <strong className="code">{trackingCodeResult}</strong>
                                    </div>

                                    <p className="rec-note">
                                        <i className="fas fa-info-circle"></i>
                                        Guarda estos datos para consultar el estado de tu reclamo. Recibirás
                                        respuesta en máximo <strong>15 días hábiles</strong>.
                                    </p>

                                    <button type="button" className="btn-enviar" onClick={nuevoReclamo}>
                                        <i className="fas fa-plus"></i> Nuevo Reclamo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB: SEGUIMIENTO */}
                    {activeTab === "seguimiento" && (
                        <div className="rec-card">
                            <div className="rec-card-header">
                                <i className="fas fa-search"></i>
                                <h2>Seguimiento de Reclamo</h2>
                                <p>Ingresa tu código de seguimiento o DNI para consultar el estado.</p>
                            </div>

                            <div className="rec-search-box">
                                <div className="rec-row two">
                                    <div className="rec-group">
                                        <label>Código de Seguimiento</label>
                                        <input
                                            type="text"
                                            value={searchCode}
                                            onChange={(e) => setSearchCode(e.target.value)}
                                            placeholder="Ej: R-JUA-1747756800000"
                                        />
                                    </div>
                                    <div className="rec-group">
                                        <label>O tu DNI</label>
                                        <input
                                            type="text"
                                            value={searchDni}
                                            onChange={(e) => setSearchDni(e.target.value)}
                                            placeholder="Ej: 12345678"
                                        />
                                    </div>
                                </div>

                                {searchError && (
                                    <div className="rec-error">
                                        <i className="fas fa-exclamation-circle"></i> {searchError}
                                    </div>
                                )}

                                <div className="rec-actions">
                                    <button
                                        type="button"
                                        className="btn-enviar"
                                        onClick={buscarReclamo}
                                        disabled={isSearching}
                                    >
                                        {!isSearching ? (
                                            <>
                                                <i className="fas fa-search"></i> Buscar Reclamo
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Buscando...
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {searchResult && (
                                <div className="rec-result">
                                    <div className="rec-result-header">
                                        <div className="rec-result-field">
                                            <span>Número de Reclamo</span>
                                            <strong>Nº {formatId(searchResult.id)}</strong>
                                        </div>
                                        <div className="rec-result-field">
                                            <span>Estado</span>
                                            <span
                                                className={`rec-status-badge ${getStatusClass(
                                                    searchResult.processing_status
                                                )}`}
                                            >
                                                {searchResult.processing_status}
                                            </span>
                                        </div>
                                        <div className="rec-result-field">
                                            <span>Tipo</span>
                                            <strong>{searchResult.claim_type}</strong>
                                        </div>
                                        <div className="rec-result-field">
                                            <span>Fecha de Presentación</span>
                                            <strong>{formatDate(searchResult.createdAt)}</strong>
                                        </div>
                                    </div>

                                    <div className="rec-result-detail">
                                        <h4>Resumen del Reclamo</h4>
                                        <p>{searchResult.claim_description}</p>
                                    </div>

                                    {searchResult.admin_response && (
                                        <div className="rec-result-response">
                                            <h4>
                                                <i className="fas fa-reply"></i> Respuesta de Matt Innova Solution
                                            </h4>
                                            <p>{searchResult.admin_response}</p>
                                            <small>Respondido el {formatDate(searchResult.responded_at)}</small>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}