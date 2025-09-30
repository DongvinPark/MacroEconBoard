
export async function loadAppMeta() {
    const response = await fetch("http://localhost:8554/meta/app/app-meta-000.json");
    if (!response.ok){
        throw new Error(`HTTP error! status : ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
    return data;
}