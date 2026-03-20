import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { GetNearbyRelayPointsDto } from './get-nearby-relay-points.dto';

describe('GetNearbyRelayPointsDto', () => {
  it('should validate a correct latitude/longitude pair', async () => {
    const dto = plainToInstance(GetNearbyRelayPointsDto, {
      latitude: '47.6582',
      longitude: '-2.7617',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.latitude).toBeCloseTo(47.6582);
    expect(dto.longitude).toBeCloseTo(-2.7617);
  });

  it('should reject invalid coordinates', async () => {
    const dto = plainToInstance(GetNearbyRelayPointsDto, {
      latitude: 123,
      longitude: -250,
    });

    const errors = await validate(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toContain('latitude');
    expect(properties).toContain('longitude');
  });
});
