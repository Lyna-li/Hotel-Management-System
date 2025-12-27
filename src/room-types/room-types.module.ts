import { Module } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';

@Module({
  providers: [RoomTypesService]
})
export class RoomTypesModule {}
