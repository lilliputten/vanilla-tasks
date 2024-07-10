type TAuthErrorObj1 = { error: string };
type TAuthErrorObj2 = { error_description: string };
type TAuthErrorObjCombo = TAuthErrorObj1 & TAuthErrorObj2;
type TAuthError = Error | string | TAuthErrorObjCombo;
interface TAuthResponse {
  clientId: string; // "436962234341-upro1dib6ubpod5319cnfptv10s9n0i9.apps.googleusercontent.com"
  client_id: string; // "436962234341-upro1dib6ubpod5319cnfptv10s9n0i9.apps.googleusercontent.com"
  credential: string; // "eyJhbGciOiJSUzI1NiIsImtpZCI6IjBlMzQ1ZmQ3ZTRhOTcyNzFkZmZhOTkxZjVhODkzY2QxNmI4ZTA4MjciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MzY5NjIyMzQzNDEtdXBybzFkaWI2dWJwb2Q1MzE5Y25mcHR2MTBzOW4waTkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MzY5NjIyMzQzNDEtdXBybzFkaWI2dWJwb2Q1MzE5Y25mcHR2MTBzOW4waTkuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDM4MDg2NzY0NTU0MTI1MzQzNDkiLCJlbWFpbCI6ImxpbGxpcHV0dGVuQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYmYiOjE3MjA2MDE2MjgsIm5hbWUiOiJJZ29yIExpbGxpcHV0dGVuIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0pKWWFLSWR1S21FQ0prTFZkVHNfUkZEdHY5WW9TemJJUEp4a2hsZHpnZEJsTF9DWmtoPXM5Ni1jIiwiZ2l2ZW5fbmFtZSI6Iklnb3IiLCJmYW1pbHlfbmFtZSI6IkxpbGxpcHV0dGVuIiwiaWF0IjoxNzIwNjAxOTI4LCJleHAiOjE3MjA2MDU1MjgsImp0aSI6IjM2MzQ3MWQxZDZlNTFjYzVjZmQ4YjE5NWQ5MWEzMjgyZTI2MjFiNzMifQ.pcP31wOIhZfvWmvcR5qezc2LJhylclXWm7bosYWuU_CemExy8zv8tvmjF-_KA0Hi3AvC3dkZntXGSOZUvU9Xc8BJgA1uV9EtlriQiRmZd8XjE-KJBHT641F21NChCBiPlmChZVIGYyel82Jh4e6Gj2Fc98haClHIPqKZhiUaeH4IHXluxIMJYYfwMiaXNSPub5DYkhQ_6oBDb3OuhKe7qRyBFZFRagmaEA6DTrhGgoQ4KIa_1TbwS_tXMOksgAxe4q5hmY_-wM0fFpbvlfCNCxM_XWn6qt69qEpCeAlnIRarAyfjLeNC5hEcLidrAhgBQWZQXbSslUzZOabqV7IGtg"
  select_by: string; // "btn"
  error?: TAuthError;
}

interface TTokenInfoData {
  alg: string; // "RS256"
  aud: string; // "436962234341-upro1dib6ubpod5319cnfptv10s9n0i9.apps.googleusercontent.com"
  azp: string; // "436962234341-upro1dib6ubpod5319cnfptv10s9n0i9.apps.googleusercontent.com"
  email: string; // "travelingburr@gmail.com"
  email_verified: string; // "true"
  exp: string; // "1720622181"
  family_name: string; // "Burr"
  given_name: string; // "Traveling"
  iat: string; // "1720618581"
  iss: string; // "https://accounts.google.com"
  jti: string; // "95aa95a6d843e4f642c9761a446e0cfd3300e1ec"
  kid: string; // "0e345fd7e4a97271dffa991f5a893cd16b8e0827"
  name: string; // "Traveling “Wild” Burr"
  nbf: string; // "1720618281"
  picture: string; // "https://lh3.googleusercontent.com/a/ACg8ocJoA6YAGsNbufUOIOTmM1JcTQ7qDnQfBUaNoUIaqH5GPvUobQE=s96-c"
  sub: string; // "115434821009576993677"
  typ: string; // "JWT"
  error?: TAuthError;
}
