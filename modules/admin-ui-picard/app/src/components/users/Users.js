import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import Link from "react-router-dom/Link";
import cn from 'classnames';
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import MainNav from "../shared/MainNav";
import TableFilters from "../shared/TableFilters";
import Table from "../shared/Table";
import Notifications from "../shared/Notifications";
import NewResourceModal from "../shared/NewResourceModal";
import {usersTemplateMap} from "../../configs/tableConfigs/usersTableConfig";
import {getTotalUsers} from "../../selectors/userSelectors";
import {fetchUsers} from "../../thunks/userThunks";
import {loadAclsIntoTable, loadGroupsIntoTable, loadUsersIntoTable} from "../../thunks/tableThunks";
import {fetchFilters} from "../../thunks/tableFilterThunks";
import {fetchGroups} from "../../thunks/groupThunks";
import {fetchAcls} from "../../thunks/aclThunks";
import {editTextFilter} from "../../actions/tableFilterActions";
import {setOffset} from "../../actions/tableActions";
import {styleNavClosed, styleNavOpen} from "../../utils/componentsUtils";

/**
 * This component renders the table view of users
 */
const Users = ({ loadingUsers, loadingUsersIntoTable, users, loadingFilters,
                   loadingGroups, loadingGroupsIntoTable, loadingAcls,
                   loadingAclsIntoTable, resetTextFilter, resetOffset }) => {
    const { t } = useTranslation();
    const [displayNavigation, setNavigation] = useState(false);
    const [displayNewUserModal, setNewUserModal] = useState(false);

    const loadUsers = async () => {
        // Fetching users from server
        await loadingUsers();

        // Load users into table
        loadingUsersIntoTable();

    }

    const loadGroups = () => {
        // Reset the current page to first page
        resetOffset();

        // Fetching groups from server
        loadingGroups();

        // Load groups into table
        loadingGroupsIntoTable();
    }

    const loadAcls = () => {
        // Reset the current page to first page
        resetOffset();

        // Fetching acls from server
        loadingAcls();

        // Load acls into table
        loadingAclsIntoTable();
    }

    useEffect(() => {
        resetTextFilter();

        // Load users on mount
        loadUsers().then(r => console.log(r));

        // Load filters
        loadingFilters('users');

        // Fetch users every minute
        let fetchUsersInterval = setInterval(loadUsers, 100000);

        return () => clearInterval(fetchUsersInterval);

    }, []);

    const toggleNavigation = () => {
        setNavigation(!displayNavigation);
    };

    const showNewUserModal = () => {
        setNewUserModal(true);
    };

    const hideNewUserModal = () => {
        setNewUserModal(false);
    };

    return (
        <>
            <section className="action-nav-bar">

                {/* Add user button */}
                <div className="btn-group">
                    {/*todo: implement onClick and with role*/}
                    <button className="add" onClick={() => showNewUserModal()}>
                        <i className="fa fa-plus"/>
                        <span>{t('USERS.ACTIONS.ADD_USER')}</span>
                    </button>
                </div>

                {/* Display modal for new acl if add acl button is clicked */}
                <NewResourceModal showModal={displayNewUserModal}
                                  handleClose={hideNewUserModal}
                                  resource="user"/>

                {/* Include Burger-button menu*/}
                <MainNav isOpen={displayNavigation}
                         toggleMenu={toggleNavigation} />

                <nav>
                    {/*todo: with role*/}
                    <Link to="/users/users"
                          className={cn({active: true})}
                          onClick={() => loadUsers()}>
                        {t('USERS.NAVIGATION.USERS')}
                    </Link>
                    <Link to="/users/groups"
                          className={cn({active: false})}
                          onClick={() => loadGroups()}>
                        {t('USERS.NAVIGATION.GROUPS')}
                    </Link>
                    <Link to="/users/acls"
                          className={cn({active: false})}
                          onClick={() => loadAcls()}>
                        {t('USERS.NAVIGATION.PERMISSIONS')}
                    </Link>
                </nav>
            </section>

            <div className="main-view" style={displayNavigation ? styleNavOpen : styleNavClosed}>
                {/* Include notifications component */}
                <Notifications />

                <div  className="controls-container">
                    {/* Include filters component */}
                    <TableFilters loadResource={loadingUsers}
                                  loadResourceIntoTable={loadingUsersIntoTable}
                                  resource={'users'}/>
                    <h1>{t('USERS.USERS.TABLE.CAPTION')}</h1>
                    <h4>{t('TABLE_SUMMARY', { numberOfRows: users })}</h4>
                </div>
                {/* Include table component */}
                <Table templateMap={usersTemplateMap} />
            </div>
        </>
    )
}

// Getting state data out of redux store
const mapStateToProps = state => ({
    users: getTotalUsers(state)
});

// Mapping actions to dispatch
const mapDispatchToProps = dispatch => ({
    loadingFilters: resource => dispatch(fetchFilters(resource)),
    loadingUsers: () => dispatch(fetchUsers()),
    loadingUsersIntoTable: () => dispatch(loadUsersIntoTable()),
    loadingGroups: () => dispatch(fetchGroups()),
    loadingGroupsIntoTable: () => dispatch(loadGroupsIntoTable()),
    loadingAcls: () => dispatch(fetchAcls()),
    loadingAclsIntoTable: () => dispatch(loadAclsIntoTable()),
    resetTextFilter: () => dispatch(editTextFilter('')),
    resetOffset: () => dispatch(setOffset(0))
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Users));
