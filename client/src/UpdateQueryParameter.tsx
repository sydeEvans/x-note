export function updateQueryParameter(param: any, value: any) {
    const baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    let newUrl = '';
    const queryString = window.location.search;
    const queryParameters = new URLSearchParams(queryString);

    // 如果参数已存在，则更新其值；如果不存在，则添加参数。
    queryParameters.set(param, value);

    newUrl = baseUrl + '?' + queryParameters.toString();

    // 不会触发页面刷新的URL更新
    window.history.replaceState(null, '', newUrl);
}
