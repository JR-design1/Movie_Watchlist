import fetch from 'node-fetch'

export async function handler(event){
    const queryStringObj = event.queryStringParameters
    
    try{
        if("s" in queryStringObj && "page" in queryStringObj && Object.keys(queryStringObj).length===2){
            url = `https://www.omdbapi.com/?apikey=${process.env.API_KEY}&s=${queryStringObj.s}&type=movie&page=${queryStringObj.page}`
        }
    
        else if("i" in queryStringObj && Object.keys(queryStringObj).length===1){
            url = `https://www.omdbapi.com/?apikey=${process.env.API_KEY}&i=${queryStringObj.i}`
        }

        else{
            throw "Error: Wrong format for query string parameters!"
        }

        const response = await fetch(url)
        const data = await response.json()

        return {
            statusCode: 200,
            body: JSON.stringify(data)
        }
    }
    catch(err){
        return  {
            statusCode: 422,
            body: err.stack
        }
    }
}