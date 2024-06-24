import React from 'react';
import { Redirect } from 'expo-router';
function TabRoot() {
    return <Redirect href={'/home'} />;
}
export default TabRoot;
