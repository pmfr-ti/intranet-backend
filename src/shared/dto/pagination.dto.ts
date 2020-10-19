export class PaginationDTO {
    filter?: string;
    sort?: {
        column?: string;
        value?: string;
    };
    pageSize?: number;
    skip?: number;
    status?: string;
}