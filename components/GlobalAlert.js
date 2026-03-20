import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert as RNAlert } from 'react-native';
import { Theme } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

// Keep reference to the actual native alert just in case
const originalAlert = RNAlert.alert;

export default class GlobalAlert extends Component {
  static alertInstance;

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      title: '',
      message: '',
      buttons: [],
      type: 'info'
    };
  }

  componentDidMount() {
    GlobalAlert.alertInstance = this;

    // Monkey Patch react-native's Alert.alert globally
    RNAlert.alert = (title, message, buttons, options) => {
      // Guess the type from title for aesthetics
      let inferredType = 'info';
      const t = (title || '').toLowerCase();
      if (t.includes('success')) inferredType = 'success';
      else if (t.includes('error') || t.includes('fail')) inferredType = 'error';
      else if (t.includes('warning') || t.includes('limit') || t.includes('insufficient')) inferredType = 'warning';

      const defaultButtons = [{ text: 'OK', onPress: () => {} }];

      this.setState({
        visible: true,
        title: title || '',
        message: message || '',
        buttons: buttons && buttons.length ? buttons : defaultButtons,
        type: inferredType
      });
    };
  }

  componentWillUnmount() {
    // Restore original alert if unmounted
    RNAlert.alert = originalAlert;
    GlobalAlert.alertInstance = null;
  }

  close = () => {
    this.setState({ visible: false });
  };

  handleButtonPress = (btn) => {
    this.close();
    if (btn.onPress && typeof btn.onPress === 'function') {
      // add a small delay to let modal closing animation finish before triggering navigate/actions
      setTimeout(() => {
        btn.onPress();
      }, 50);
    }
  };

  render() {
    const { visible, title, message, buttons, type } = this.state;

    let iconName = 'information-circle';
    let iconColor = Theme.colors.primary;

    if (type === 'success') {
      iconName = 'checkmark-circle';
      iconColor = '#10B981';
    } else if (type === 'error') {
      iconName = 'close-circle';
      iconColor = '#EF4444';
    } else if (type === 'warning') {
      iconName = 'warning';
      iconColor = '#F59E0B';
    }

    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            
            <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
              <Ionicons name={iconName} size={40} color={iconColor} />
            </View>

            <Text style={styles.title}>{title}</Text>
            {message ? <Text style={styles.message}>{message}</Text> : null}

            <View style={styles.buttonContainer}>
              {buttons.map((btn, index) => {
                const isPrimary = index === buttons.length - 1; // last button is usually primary
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.button, 
                      isPrimary ? { backgroundColor: Theme.colors.primary } : styles.secondaryButton,
                      buttons.length > 2 && { width: '100%', marginBottom: 10 }
                    ]}
                    onPress={() => this.handleButtonPress(btn)}
                  >
                    <Text style={[
                      styles.buttonText,
                      !isPrimary && { color: Theme.colors.text }
                    ]}>
                      {btn.text || 'OK'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '45%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
