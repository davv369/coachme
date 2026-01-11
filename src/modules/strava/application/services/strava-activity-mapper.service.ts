import { Injectable } from '@nestjs/common';
import { StravaActivity } from '../../domain/strava-activity.entity';
import { WorkoutType } from '@modules/exercises/domain/workout-type.enum';

@Injectable()
export class StravaActivityMapperService {
  /**
   * Maps Strava activity type to our WorkoutType enum
   */
  mapStravaTypeToWorkoutType(stravaType: string): WorkoutType {
    const typeMap: Record<string, WorkoutType> = {
      Run: WorkoutType.RUNNING,
      Ride: WorkoutType.CYCLING,
      VirtualRide: WorkoutType.CYCLING,
      Swim: WorkoutType.SWIMMING,
      Walk: WorkoutType.RECOVERY,
      Hike: WorkoutType.HIKING,
      WeightTraining: WorkoutType.STRENGTH,
      Workout: WorkoutType.STRENGTH,
      // Default to RUNNING for unknown types
    };

    return typeMap[stravaType] || WorkoutType.RUNNING;
  }

  /**
   * Maps Strava activity to actualParameters for TrainingSession
   * Extracts and maps relevant fields from Strava activity
   */
  mapActivityToParameters(activity: StravaActivity): Record<string, any> {
    const params: Record<string, any> = {};

    // Distance - convert meters to km for running/cycling
    if (activity.distance > 0) {
      if (
        activity.type === 'Run' ||
        activity.type === 'Ride' ||
        activity.type === 'VirtualRide' ||
        activity.type === 'Walk' ||
        activity.type === 'Hike'
      ) {
        params.distanceKm = (activity.distance / 1000).toFixed(2);
      } else if (activity.type === 'Swim') {
        params.distanceMeters = activity.distance;
      }
    }

    // Time/Duration
    if (activity.movingTime > 0) {
      params.durationMinutes = Math.round(activity.movingTime / 60);
      params.durationSeconds = activity.movingTime;
    }

    // Elevation
    if (activity.totalElevationGain > 0) {
      params.elevationGainMeters = activity.totalElevationGain;
    }

    // Speed/Pace
    if (activity.averageSpeed) {
      if (activity.type === 'Run' || activity.type === 'Walk') {
        // Convert m/s to min/km pace
        const paceSecondsPerKm = 1000 / activity.averageSpeed;
        const minutes = Math.floor(paceSecondsPerKm / 60);
        const seconds = Math.floor(paceSecondsPerKm % 60);
        params.pace = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else if (activity.type === 'Ride' || activity.type === 'VirtualRide') {
        // Convert m/s to km/h
        params.averageSpeedKmh = (activity.averageSpeed * 3.6).toFixed(2);
      }
    }

    if (activity.maxSpeed) {
      if (activity.type === 'Ride' || activity.type === 'VirtualRide') {
        params.maxSpeedKmh = (activity.maxSpeed * 3.6).toFixed(2);
      }
    }

    // Cadence
    if (activity.averageCadence) {
      params.cadence = activity.averageCadence;
    }

    // Power (cycling)
    if (activity.averageWatts) {
      params.averagePowerWatts = activity.averageWatts;
    }

    if (activity.weightedAverageWatts) {
      params.weightedAveragePowerWatts = activity.weightedAverageWatts;
    }

    // Heart rate
    if (activity.averageHeartrate) {
      params.averageHeartRate = activity.averageHeartrate;
    }

    if (activity.maxHeartrate) {
      params.maxHeartRate = activity.maxHeartrate;
    }

    // Calories
    if (activity.calories) {
      params.calories = activity.calories;
    }

    // Strava metadata (only name and type in parameters, ID is stored separately)
    params.stravaActivityName = activity.name;
    params.stravaActivityType = activity.type;

    // Additional Strava data
    if (activity.elapsedTime > 0) {
      params.elapsedTimeSeconds = activity.elapsedTime;
    }
    if (activity.kilojoules) {
      params.kilojoules = activity.kilojoules;
    }
    if (activity.timezone) {
      params.timezone = activity.timezone;
    }
    if (activity.startDateLocal) {
      params.startDateLocal = activity.startDateLocal.toISOString();
    }

    return params;
  }
}
