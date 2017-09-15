import React from 'react';
import {timeSince} from '../../utils/utils';
import {Link, Route} from 'react-router-dom';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from '../../actions/search';
import Waypoint from 'react-waypoint';


class Views extends React.Component {
	constructor(props){
		super(props)
		this.state = {
			viewCount: ''
		}
	}

	componentDidMount() {
		this.getStatistics(this.props.id)
	}

	getStatistics(id) {
		fetch('https://www.googleapis.com/youtube/v3/videos?part=statistics&id=' + id +'&key=AIzaSyC1U2ObFKJmvmDltBCA_M6S3xHS3lNo-pg')
			.then(response => response.json())
			.then(data => 
			this.setState({viewCount: data.items[0].statistics.viewCount})
		)
	}

	render() {
		return(
			<li>
				{parseInt(this.state.viewCount).toLocaleString('en')}
			</li>
		)
	}

}

class Search extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			loading: false
		}
	}

	componentDidMount() {
		if (this.props.value == '') {
			const unfiltered = this.props.location.pathname.substr(this.props.location.pathname.lastIndexOf('/') + 1);
			const filtered = unfiltered.replace(/\+/g, " ")
			this.props.fetchNewSearch(filtered)
		} else {
			this.props.fetchNewSearch(this.props.value)	
		}
	}

	componentWillReceiveProps(nextProps) {
		if(nextProps.value !== this.props.value) {
			const nextQuery = nextProps.value
			this.props.fetchNewSearch(nextQuery)
		}
	}

	infiniteLoad() {
		if (!this.state.loading && this.props.pageToken) {
			this.setState({loading: true});
			this.props.fetchSearch(this.props.value, this.props.pageToken)
			this.setState({loading: false})
		}
	}

	render() {
		const cn = (this.props.visible) ? 'vid-grid' : 'vid-grid-hidden';
		return(
			<div className={cn}>
				{this.props.videos.map((vid, key) => {
					return (
						<div className="vid" key={key}> 
							<Link to={'/video/' + vid.id.videoId}><img src={vid.snippet.thumbnails.medium.url} className="thumbnail"/></Link>
							<h3 className="vid-title"><Link to={'/video/' + vid.id.videoId}>{vid.snippet.title}</Link></h3>
							<p className="vid-channel">{vid.snippet.channelTitle}</p>
							<ul className="vid-stats">
								<Views id={vid.id.videoId}/>
								<li>{timeSince(vid.snippet.publishedAt)}</li>
							</ul>
						</div>
					);
				})}
				<Waypoint onEnter={this.infiniteLoad.bind(this)} threshold={2.0} />
			</div>
		)
	}
}

function mapStateToProps(state) {
	return {
		videos: state.app.videos.search,
		pageToken: state.app.pageToken.search,
		value: state.app.searchValue,
		visible: state.app.visible
	}
}

function mapDispatchToProps(dispatch) {
	return {
		fetchSearch: bindActionCreators(actions.fetchSearch, dispatch),
		fetchNewSearch: bindActionCreators(actions.fetchNewSearch, dispatch),
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)