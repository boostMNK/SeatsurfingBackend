import React from 'react';
import { Booking, Formatting } from 'flexspace-commons';
import { withTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { PathRouteProps } from 'react-router-dom';
import Loading from '../components/Loading';
import { Button, Form, ListGroup, Modal } from 'react-bootstrap';
import { LogIn as IconEnter, LogOut as IconLeave, MapPin as IconLocation } from 'react-feather';

interface State {
  loading: boolean
  selectedItem: Booking | null
}

interface Props extends PathRouteProps {
  t: TFunction
}

class Bookings extends React.Component<Props, State> {
  data: Booking[];

  constructor(props: any) {
    super(props);
    this.data = [];
    this.state = {
      loading: true,
      selectedItem: null
    };
  }

  componentDidMount = () => {
    this.loadData();
  }

  loadData = () => {
    Booking.list().then(list => {
      this.data = list;
      this.setState({ loading: false });
    });
  }

  onItemPress = (item: Booking) => {
    this.setState({ selectedItem: item });
  }

  cancelBooking = (item: Booking | null) => {
    this.setState({
      loading: true
    });
    this.state.selectedItem?.delete().then(() => {
      this.setState({
        selectedItem: null,
      }, this.loadData);
    });
  }

  renderItem = (item: Booking) => {
    console.log(item.enter.toISOString());
    return (
      <ListGroup.Item key={item.id} action={true} onClick={(e) => { e.preventDefault(); this.onItemPress(item); }}>
        <h5>{Formatting.getDateOffsetText(item.enter, item.leave)}</h5>
        <p>
          <IconLocation className="feather" />&nbsp;{item.space.location.name}, {item.space.name}<br />
          <IconEnter className="feather" />&nbsp;{Formatting.getFormatter().format(item.enter)}<br />
          <IconLeave className="feather" />&nbsp;{Formatting.getFormatter().format(item.leave)}
        </p>
      </ListGroup.Item>
    );
  }

  render() {
    if (this.state.loading) {
      return <Loading />;
    }
    if (this.data.length === 0) {
      return (
        <div className="container-signin">
          <Form className="form-signin">
            <p>{this.props.t("noBookings")}</p>
          </Form>
        </div>
      );
    }
    return (
      <>
        <div className="container-signin">
          <Form className="form-signin">
            <ListGroup>
              {this.data.map(item => this.renderItem(item))}
            </ListGroup>
          </Form>
        </div>
        <Modal show={this.state.selectedItem != null} onHide={() => this.setState({ selectedItem: null })}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.t("cancelBooking")}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{this.props.t("confirmCancelBooking", {enter: Formatting.getFormatter().format(this.state.selectedItem?.enter), interpolation: {escapeValue: false}})}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => this.setState({ selectedItem: null })}>
              {this.props.t("back")}
            </Button>
            <Button variant="danger" onClick={() => this.cancelBooking(this.state.selectedItem)}>
              {this.props.t("cancelBooking")}
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  }
}

export default withTranslation()(Bookings as any);
