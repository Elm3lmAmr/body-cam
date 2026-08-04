import 'package:bloc/bloc.dart';

class IncidentEvent {}
class IncidentState {}

class IncidentBloc extends Bloc<IncidentEvent, IncidentState> {
  IncidentBloc() : super(IncidentState()) {
    // Add event handlers
  }
}
