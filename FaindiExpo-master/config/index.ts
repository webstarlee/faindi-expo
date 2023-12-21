export const API_URL = `https://faindi-backend-production.up.railway.app/api`;
export const HOST_URL = `https://faindi-backend-production.up.railway.app/`;
// export const API_URL = `http://192.168.107.139:8082/api`;
// export const HOST_URL = `http://192.168.107.139:8082/`;

export const convertApiUrl = (url: string, param = "") => {
    let finalUrl = API_URL + "/" + url;
    if (param !== "") {
        finalUrl = finalUrl + "/" + param;
    }
    return finalUrl;
}