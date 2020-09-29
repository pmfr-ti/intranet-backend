import { PipeTransform, ArgumentMetadata, BadRequestException } from "@nestjs/common";

export class ValidationParametersPipe implements PipeTransform {

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    transform(value: any, metadata: ArgumentMetadata) {
        if (!value) {
            throw new BadRequestException(`O valor do parâmetro ${metadata.data} deve ser informado`);
        }
        return value;
    }
}
