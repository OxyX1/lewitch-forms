from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from typing import List

app = FastAPI()

connected_clients: List[WebSocket] = []

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)
    
    try:
        while True:
            message = await websocket.receive_text()
            for client in connected_clients:
                if client != websocket:
                    await client.send_text(message)
    except:
        connected_clients.remove(websocket)

app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
