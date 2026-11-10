export interface Meta {
    name: string;
    description: string;
    website: string;
    location: string;
    email: string;
}

export interface ApiResponse<T> {
    data: T;
    meta?: Meta;
}