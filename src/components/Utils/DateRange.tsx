import * as act from '@/store/actions/actionTypes';
import {ReducersType} from '@/store/reducers';
import {SearchFilterState, SearchFilterAction, DateRange} from '@/store/reducers/searchFilter';
import Event from '@material-ui/icons/Event';
import moment, {Moment} from 'moment';
import React, {useState, useEffect, ComponentType} from 'react';
import {DateRangePicker, FocusedInputShape} from 'react-dates';
import {connect} from 'react-redux';
import {compose} from 'recompose';
import {Dispatch} from 'redux';
import 'react-dates/initialize';
import '@/styles/date-picker.scss';
import '@/styles/Airbnb/date-picker-homepage.scss';


interface IProps {
  filter: SearchFilterState
  updateDate(date: DateRange): any
}

const DateRangePK: ComponentType<IProps> = (props: IProps) => {
  const {filter, updateDate} = props;

  const onDateChange = (startDate: Moment | null, endDate: Moment | null) => {
    if (focusedInput === 'startDate') {
      endDate = null
    }
    updateDate({startDate, endDate});
  };

  useEffect(() => {
    let checkFilter = !filter.startDate && !filter.endDate;
    let oldDate     = moment(filter.startDate) < moment();

    if (checkFilter || oldDate) {
      updateDate({
        startDate: moment(),
        endDate: moment().add(7, 'days'),
      });
    }

  }, []);

  const [focusedInput, setFocusedInput] = useState<FocusedInputShape | null>(null);
  return (
    <DateRangePicker
      startDateId = 'startDate'
      endDateId = 'endDate'
      startDate = {filter.startDate ? moment(filter.startDate) : null}
      endDate = {filter.endDate ? moment(filter.endDate) : null}
      onDatesChange = {({startDate, endDate}) => {
        onDateChange(startDate, endDate);
      }}
      focusedInput = {focusedInput}
      onFocusChange = {focusedInput => {
        setFocusedInput(focusedInput);
      }}
      minimumNights = {0}
      customInputIcon = {<Event />}
      noBorder
      displayFormat = 'DD/MM/YYYY'
      hideKeyboardShortcutsPanel
      // isDayBlocked={(day: Moment) => {
      //   console.log(day.format('YYYY-MM-DD'));
      //   return day.format('YYYY-MM-DD') == moment('2019-01-12').format('YYYY-MM-DD');
      // }}
      readOnly
    />
  );
};

const mapStateToProps = (state: ReducersType) => {
  return {
    filter: state.searchFilter,
  };
};

const mapDispatchToProps = (dispatch: Dispatch<SearchFilterAction>) => {
  return {
    updateDate: (date: DateRange) => dispatch({
      type: act.CHANGE_DATE,
      date: date,
    }),
  };
};

export default compose<IProps, any>(
  connect(mapStateToProps, mapDispatchToProps),
)(DateRangePK);
