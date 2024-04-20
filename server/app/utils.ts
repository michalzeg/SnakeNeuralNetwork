

export const fetchWithRetry = async (url: string, retryCount = 4): Promise<Response> =>{

    for (let i = 0; i < retryCount; i++) {
        try {
            const response = await fetch(url);
            return response;
        } catch (error) {
            console.error(error);
        }
    }

    throw new Error('Max retries reached');
}