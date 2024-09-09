from flask import Flask, jsonify, request
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_cors import CORS
from flask_caching import Cache

app = Flask(__name__)
CORS(app)

app.config['CACHE_TYPE'] = 'simple'
app.config['CACHE_DEFAULT_TIMEOUT'] = 300
cache = Cache(app)


client = MongoClient('mongodb://localhost:27017/')
db = client['kanban'] 
Cards = db['Cards']  
Columns = db['Columns'] 


@app.route('/api/add', methods=['POST'])
def add_data():
    data = request.json
    response = collection.insert_one(data)
    return jsonify({'result': 'success', 'document_id': str(response.inserted_id)})


@app.route('/api/Cards', methods=['GET'])
@cache.cached()
def get_Cards():
    Card = Cards.find()
    result = [{k: v for k, v in C.items() if k != '_id'} for C in Card]
    result = transform_form(result)
    return jsonify(result)


@app.route('/api/Columns', methods=['GET'])
@cache.cached()
def get_Columns():
    Column = Columns.find()
    result = [{k: v for k, v in C.items() if k != '_id'} for C in Column]
    result = transform_form(result)
    return jsonify(result)


@app.route('/api/Cards', methods=['POST'])
def insert_Cards():
    data = request.json
    response = Cards.insert_one(data)
    cache.delete('/api/Cards')
    return jsonify({'result': 'success', 'document_id': str(response.inserted_id)})


@app.route('/api/Columns/<id>', methods=['PUT'])
def update_Columns(id):
    update_data = request.json
    result = Columns.update_one({'id': id}, {'$set': update_data})
    print(f"Update data: {update_data}")
    if result.modified_count > 0:
        cache.delete('/api/Columns')
        return jsonify({'success': True, 'message': 'Document updated'}), 200
    else:
        return jsonify({'success': False, 'message': 'No document found with provided ID or no changes made'}), 404


@app.route('/api/Cards/<id>', methods=['PUT'])
def update_Cards(id):
    update_data = request.json
    result = Cards.update_one({'id': id}, {'$set': update_data})
    if result.modified_count > 0:
        cache.delete('/api/Cards')
        return jsonify({'success': True, 'message': 'Document updated'}), 200
    else:
        return jsonify({'success': False, 'message': 'No document found with provided ID or no changes made'}), 404


@app.route('/api/Cards/<id>', methods=['DELETE'])
def delete_Cards(id):
    result = Cards.delete_one({'id': id})
    if result.deleted_count > 0:
        cache.delete('/api/Cards')
        return jsonify({'success': True, 'message': 'Document deleted'}), 200
    else:
        return jsonify({'success': False, 'message': 'No document found with provided ID'}), 404

def transform_form(documents):
    result = {doc['id']: {k: v for k, v in doc.items() if k != '_id'} for doc in documents}
    return result

@app.after_request
def set_csp(response):
    response.headers['Content-Security-Policy'] = "default-src 'self'; script-src 'self'"
    return response

# 啟動 Flask 服務器
if __name__ == '__main__':
    app.run(debug=True)
