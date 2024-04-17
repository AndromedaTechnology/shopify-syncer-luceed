class ShopifyHelper {
  public shopifyResponseHeaderGetNextLink(
    axiosResponseHeaders: any
  ): string | undefined {
    let responseLinks1 =
      axiosResponseHeaders?.link?.match(/(?<=\<).+?(?=\>; rel=\"next\")/g) ??
      [];
    let responseLinks2 =
      axiosResponseHeaders?.link?.match(
        /(?<=; rel=\"previous\", \<).+?(?=\>)/g
      ) ?? [];

    let responseLinks: Array<string> = [];
    if (responseLinks2 && responseLinks2.length === 1) {
      responseLinks = [responseLinks2[0]];
    } else if (responseLinks1 && responseLinks1.length === 1) {
      responseLinks = [responseLinks1[0]];
    }

    let nextLink;
    if (responseLinks && responseLinks.length) {
      nextLink = responseLinks[0];
    }
    return nextLink;
  }
}

export default new ShopifyHelper();
