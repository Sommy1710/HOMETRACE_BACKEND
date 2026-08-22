import WebSocket from "ws";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OTkxMTZhY2Y4NWEwOGNhODg5OWRkOCIsImVtYWlsIjoibWFydGluc29tdG9AeWFob28uY29tIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3ODczNTM5MjEsImV4cCI6MTc4NzM1NzUyMX0.VeEyrqD0mO-RhDsQlSFnzlak_4fyu2-Iso-HrPXNj3o";

const socket = new WebSocket(
    "ws://localhost:46754",
    {
        headers: {
            Cookie: `authentication=${token}`
        }
    }
);


socket.on("open", () => {

    console.log("✅ WebSocket connected");

});


socket.on("message", (data) => {

    console.log(
        "📩 Received:",
        JSON.parse(data.toString())
    );

});


socket.on("error", (error) => {

    console.error(
        "❌ WebSocket error:",
        error
    );

});


socket.on("close", (code, reason) => {

    console.log(
        "🔌 WebSocket closed:",
        code,
        reason.toString()
    );

});