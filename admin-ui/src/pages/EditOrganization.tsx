import React from 'react';
import FullLayout from '../components/FullLayout';
import { Form, Col, Row, Button, Alert, InputGroup } from 'react-bootstrap';
import { ChevronLeft as IconBack, Save as IconSave, Trash2 as IconDelete } from 'react-feather';
import { Link, PathRouteProps, Params, NavigateFunction, Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { Domain, Organization, User } from 'flexspace-commons';
import { withTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { withRouter } from '../types/withRouter';
import { withNavigate } from '../types/withNavigate';

interface State {
  loading: boolean
  submitting: boolean
  saved: boolean
  error: boolean
  goBack: boolean
  name: string
  firstname: string
  lastname: string
  email: string
  country: string
  language: string
  domain: string
  password: string
}

interface Props extends PathRouteProps {
  navigate: NavigateFunction
  params: Readonly<Params<string>>
  t: TFunction
}

class EditOrganization extends React.Component<Props, State> {
  entity: Organization = new Organization();

  constructor(props: any) {
    super(props);
    this.state = {
      loading: true,
      submitting: false,
      saved: false,
      error: false,
      goBack: false,
      name: "",
      firstname: "",
      lastname: "",
      email: "",
      country: "DE",
      language: "de",
      domain: "",
      password: "",
    };
  }

  componentDidMount = () => {
    this.loadData();
  }

  loadData = () => {
    if (this.props.params.id) {
      Organization.get(this.props.params.id).then(org => {
        this.entity = org;
        this.setState({
          name: org.name,
          firstname: org.contactFirstname,
          lastname: org.contactLastname,
          email: org.contactEmail,
          country: org.country,
          language: org.language,
          loading: false,
        });
      });
    } else {
      this.setState({ loading: false });
    }
  }

  onSubmit = (e: any) => {
    e.preventDefault();
    this.setState({
      error: false,
      saved: false
    });
    this.entity.name = this.state.name;
    this.entity.contactFirstname = this.state.firstname;
    this.entity.contactLastname = this.state.lastname;
    this.entity.contactEmail = this.state.email;
    this.entity.country = this.state.country;
    this.entity.language = this.state.language;
    let createUser = (!this.entity.id);
    this.entity.save().then(() => {
      console.log("org saved, id = " + this.entity.id);
      if (createUser) {
        Domain.add(this.entity.id, this.state.domain).then(() => {
          console.log("domain added");
          let user = new User();
          user.organizationId = this.entity.id;
          user.email = "admin@" + this.state.domain;
          user.password = this.state.password;
          user.requirePassword = true;
          user.admin = true;
          user.superAdmin = false;
          user.save().then(() => {
            this.props.navigate("/organizations/" + this.entity.id);
            this.setState({ saved: true });
          });
        });
      } else {
        this.props.navigate("/organizations/" + this.entity.id);
        this.setState({ saved: true });
      }
    }).catch(() => {
      this.setState({ error: true });
    });
  }

  deleteItem = () => {
    if (window.confirm(this.props.t("confirmDeleteOrg"))) {
      this.entity.delete().then(() => {
        this.setState({ goBack: true });
      });
    }
  }

  render() {
    if (this.state.goBack) {
      return <Navigate replace={true} to={`/organizations`} />
    }

    let backButton = <Link to="/organizations" className="btn btn-sm btn-outline-secondary"><IconBack className="feather" /> {this.props.t("back")}</Link>;
    let buttons = backButton;

    if (this.state.loading) {
      return (
        <FullLayout headline={this.props.t("editOrg")} buttons={buttons}>
          <Loading />
        </FullLayout>
      );
    }

    let hint = <></>;
    if (this.state.saved) {
      hint = <Alert variant="success">{this.props.t("entryUpdated")}</Alert>
    } else if (this.state.error) {
      hint = <Alert variant="danger">{this.props.t("errorSave")}</Alert>
    }

    let buttonDelete = <Button className="btn-sm" variant="outline-secondary" onClick={this.deleteItem} disabled={false}><IconDelete className="feather" /> {this.props.t("delete")}</Button>;
    let buttonSave = <Button className="btn-sm" variant="outline-secondary" type="submit" form="form"><IconSave className="feather" /> {this.props.t("save")}</Button>;
    if (this.entity.id) {
      buttons = <>{backButton} {buttonDelete} {buttonSave}</>;
    } else {
      buttons = <>{backButton} {buttonSave}</>;
    }

    let countries = ["BE", "BG", "DK", "DE", "EE", "FJ", "FR", "GR", "IE", "IT", "HR", "LV", "LT", "LU", "MT", "NL", "AT", "PL", "PT", "RO", "SE", "SK", "SI", "ES", "CY", "CZ", "HU"];
    let languages = ["de", "en"];

    let adminSection = <></>;
    if (!this.entity.id) {
      adminSection = (
        <>
          <Form.Group as={Row}>
            <Form.Label column sm="6" className="lead text-uppercase">{this.props.t("admin")}</Form.Label>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">{this.props.t("domain")}</Form.Label>
            <Col sm="4">
              <InputGroup>
                <Form.Control plaintext={true} readOnly={true} defaultValue="admin@" />
                <Form.Control type="text" placeholder={this.props.t("yourDomainPlaceholder")} value={this.state.domain} onChange={(e: any) => this.setState({ domain: e.target.value })} required={true} />
              </InputGroup>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">{this.props.t("password")}</Form.Label>
            <Col sm="4">
              <Form.Control type="password" value={this.state.password} onChange={(e: any) => this.setState({ password: e.target.value })} required={true} minLength={8} />
            </Col>
          </Form.Group>
        </>
      );
    }

    return (
      <FullLayout headline={this.props.t("editOrg")} buttons={buttons}>
        <Form onSubmit={this.onSubmit} id="form">
          {hint}
          <Form.Group as={Row}>
            <Form.Label column sm="2">{this.props.t("org")}</Form.Label>
            <Col sm="4">
              <Form.Control type="text" value={this.state.name} onChange={(e: any) => this.setState({ name: e.target.value })} required={true} autoFocus={true} />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">{this.props.t("country")}</Form.Label>
            <Col sm="4">
              <Form.Control as="select" value={this.state.country} onChange={(e: any) => this.setState({ country: e.target.value })} required={true}>
                {countries.map(cc => <option key={cc}>{cc}</option>)}
              </Form.Control>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">{this.props.t("language")}</Form.Label>
            <Col sm="4">
              <Form.Control as="select" value={this.state.language} onChange={(e: any) => this.setState({ language: e.target.value })} required={true}>
                {languages.map(lc => <option key={lc}>{lc}</option>)}
              </Form.Control>
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="6" className="lead text-uppercase">{this.props.t("primaryContact")}</Form.Label>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">{this.props.t("firstname")}</Form.Label>
            <Col sm="4">
              <Form.Control type="text" value={this.state.firstname} onChange={(e: any) => this.setState({ firstname: e.target.value })} required={true} />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">{this.props.t("lastname")}</Form.Label>
            <Col sm="4">
              <Form.Control type="text" value={this.state.lastname} onChange={(e: any) => this.setState({ lastname: e.target.value })} required={true} />
            </Col>
          </Form.Group>
          <Form.Group as={Row}>
            <Form.Label column sm="2">{this.props.t("emailAddress")}</Form.Label>
            <Col sm="4">
              <Form.Control type="email" value={this.state.email} onChange={(e: any) => this.setState({ email: e.target.value })} required={true} />
            </Col>
          </Form.Group>
          {adminSection}
        </Form>
      </FullLayout>
    );
  }
}

export default withNavigate(withRouter(withTranslation()(EditOrganization as any)));
