export const getXsrfToken = (): string => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; XSRF-TOKEN=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
    return '';
};

/**
 * Генерирует заголовки для запросов.
 * @param isJson - если true (по умолчанию), добавляет Content-Type: application/json.
 * если false (для FormData), заголовок не добавляется, чтобы браузер выставил boundary.
 */
export const getHeaders = (isJson: boolean = true) => {
    const headers: Record<string, string> = {
        'Accept': 'application/json',
        'X-XSRF-TOKEN': getXsrfToken()
    };

    if (isJson) {
        headers['Content-Type'] = 'application/json';
    }

    return headers;
};