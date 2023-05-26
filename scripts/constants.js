/**
 * Contains any constants for the application
 */
export default class Constants {
  static MODULE_ID = 'dfreds-effects-panel';
  static CE_MODULE_ID = 'dfreds-convenient-effects';

  static RIGHT_CLICK_BEHAVIOR = {
    DIALOG: 'dialog',
    DELETE: 'delete',
    DISABLE: 'disable',
  };

  static SECONDS = {
    IN_ONE_ROUND: 6,
    IN_ONE_MINUTE: 60,
    IN_TWO_MINUTES: 120,
    IN_ONE_HOUR: 3_600,
    IN_TWO_HOURS: 7_200,
    IN_ONE_DAY: 86_400,
    IN_TWO_DAYS: 172_800,
    IN_ONE_WEEK: 604_800,
    IN_TWO_WEEKS: 1_209_600,
    IN_ONE_YEAR: 31_536_000,
    IN_TWO_YEARS: 63_072_000,
  };

  static USER_FLAGS = {
    TOP_POSITION: 'topPosition',
  };
}
