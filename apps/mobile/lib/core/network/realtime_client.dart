import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';

class RealtimeEvent {
  final String id;
  final String event;
  final Map<String, dynamic> payload;

  const RealtimeEvent({
    required this.id,
    required this.event,
    required this.payload,
  });
}

class RealtimeClient {
  RealtimeClient({required this.wsUrl});

  final String wsUrl;
  final _controller = StreamController<RealtimeEvent>.broadcast();
  WebSocketChannel? _channel;
  Timer? _reconnectTimer;
  Timer? _pingTimer;
  int _attempt = 0;
  bool _disposed = false;
  String? _token;

  Stream<RealtimeEvent> get events => _controller.stream;

  void connect(String accessToken) {
    _token = accessToken;
    _disposed = false;
    _openSocket();
  }

  void _openSocket() {
    if (_disposed || _token == null) return;
    _channel?.sink.close();
    final uri = Uri.parse('$wsUrl?token=$_token');
    _channel = WebSocketChannel.connect(uri);

    _pingTimer?.cancel();
    _pingTimer = Timer.periodic(const Duration(seconds: 25), (_) {
      _channel?.sink.add('{"type":"ping"}');
    });

    _channel!.stream.listen(
      (raw) {
        _attempt = 0;
        final decoded = jsonDecode(raw.toString()) as Map<String, dynamic>;
        if (decoded['event'] != null) {
          _controller.add(
            RealtimeEvent(
              id: decoded['id'] as String? ?? '',
              event: decoded['event'] as String,
              payload: (decoded['payload'] as Map<String, dynamic>?) ?? const {},
            ),
          );
        }
      },
      onDone: _scheduleReconnect,
      onError: (_) => _scheduleReconnect(),
    );
  }

  void _scheduleReconnect() {
    if (_disposed) return;
    _pingTimer?.cancel();
    _attempt = (_attempt + 1).clamp(1, 5);
    final delaySeconds = 1 << _attempt;
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(Duration(seconds: delaySeconds), _openSocket);
  }

  void disconnect() {
    _disposed = true;
    _pingTimer?.cancel();
    _reconnectTimer?.cancel();
    _channel?.sink.close();
  }

  void dispose() {
    disconnect();
    _controller.close();
  }
}
